import { ApplyOptions } from '@sapphire/decorators';
import { Time } from '@sapphire/duration';
import { container } from '@sapphire/framework';
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, roleMention } from 'discord.js';
import type { APIEmbedField, Channel } from 'discord.js';
import humanizeDuration from 'humanize-duration';
import type { HolodexVideoWithChannel } from '../../lib/holodex/types/videos.js';
import { BrandColors, EmbedColors } from '../../lib/utilities/constants.js';

@ApplyOptions<ScheduledTask.Options>({
	name: 'youtubeNotify',
	pattern: '0 */1 * * * *', // Every minute
	enabled: container.config.enableTasks,
	customJobOptions: {
		jobId: 'tasks:youtubeNotify',
	},
})
export class YoutubeTask extends ScheduledTask {
	private readonly streamsKey = 'youtube:streams:list';

	public override async run(): Promise<void> {
		const { prisma, holodex, logger, redis, metrics } = this.container;

		logger.debug('[YoutubeTask] Checking subscriptions');

		const channelIds = await prisma.youtubeSubscription
			.groupBy({
				where: {
					AND: {
						NOT: { discordChannelId: null },
						youtubeSettings: { enabled: true },
					},
				},
				by: ['channelId'],
			})
			.then((res) => res.map(({ channelId }) => channelId));
		if (channelIds.length < 1) return;

		const liveStreams = await holodex.videos
			.getLive({
				channels: channelIds,
			})
			.then((streams) =>
				streams.filter(({ available_at }) => {
					return new Date(available_at).getTime() < Date.now() + Time.Hour;
				}),
			)
			.catch(() => null);
		if (!liveStreams) return;

		metrics.incrementHolodex();

		const cachedStreams = await redis.hGetValues<HolodexVideoWithChannel>(this.streamsKey);
		const danglingStreams = cachedStreams.filter(({ channel }) => {
			return !channelIds.includes(channel.id);
		});
		const pastStreams = cachedStreams.filter(({ id }) => {
			const isDangling = danglingStreams.some((stream) => stream.id === id);
			const isLive = liveStreams.some((stream) => stream.id === id);
			return !(isDangling || isLive);
		});

		logger.debug(
			`[YoutubeTask] ${liveStreams.length} live/upcoming streams, ${danglingStreams.length} dangling streams, ${pastStreams.length} past streams`,
		);

		for (const stream of liveStreams) {
			const availableAt = new Date(stream.available_at).getTime();
			if (availableAt < Date.now() - Time.Minute * 15) {
				continue;
			}

			if (stream.status === 'live' || (stream.status === 'upcoming' && availableAt < Date.now())) {
				const notificationSent = await redis.get<boolean>(this.notificationKey(stream.id));

				if (!notificationSent) {
					await this.handleLive(stream);
					await redis.set(this.notificationKey(stream.id), true);
				}
			}
		}

		const keysToDelete: string[] = [this.streamsKey];

		if (pastStreams.length > 0) {
			await Promise.allSettled(
				pastStreams //
					.filter((stream) => channelIds.includes(stream.channel.id))
					.map(async (stream) => {
						const messages = await redis.hGetAll<{ channelId: string }>(this.messagesKey(stream.id));
						if (messages.size < 1) return;
						await this.handleEnded(stream, messages);
					}),
			);

			for (const stream of pastStreams) {
				keysToDelete.push(this.messagesKey(stream.id), this.notificationKey(stream.id));
			}
		}

		if (danglingStreams.length > 0) {
			for (const stream of danglingStreams) {
				keysToDelete.push(this.messagesKey(stream.id), this.notificationKey(stream.id));
			}
		}

		await redis.deleteMany(keysToDelete);

		if (liveStreams.length > 0) {
			await redis.hmSet(
				this.streamsKey,
				new Map<string, HolodexVideoWithChannel>(
					liveStreams.map((stream) => [stream.id, stream]), //
				),
			);
		} else {
			await redis.delete(this.streamsKey);
		}
	}

	/**
	 * Send live notifications for a stream.
	 * @param stream - The YouTube stream
	 */
	private async handleLive(stream: HolodexVideoWithChannel): Promise<void> {
		const { client, youtube, validator, metrics, logger, redis } = this.container;

		logger.debug(`[YoutubeTask] Sending notification for ${stream.title}`);

		const membersOnly = stream.topic_id === 'membersonly';
		const subscriptions = await youtube.subscriptions.getValid(stream.channel.id);

		const embed = new EmbedBuilder() //
			.setColor(BrandColors.Youtube)
			.setAuthor({
				name: stream.channel.name,
				url: `https://www.youtube.com/channel/${stream.channel.id}`,
			})
			.setTitle(stream.title)
			.setURL(`https://youtu.be/${stream.id}`)
			.setThumbnail(stream.channel.photo)
			.setImage(`https://i.ytimg.com/vi/${stream.id}/maxresdefault.jpg`);

		const components = new ActionRowBuilder<ButtonBuilder>().setComponents([
			new ButtonBuilder() //
				.setStyle(ButtonStyle.Link)
				.setURL(`https://youtu.be/${stream.id}`)
				.setLabel('Watch Stream'),
		]);

		const keysToSet = new Map<string, { channelId: string }>();

		const result = await Promise.allSettled(
			subscriptions.map(async (subscription) => {
				let discordChannel: Channel | null;
				if (membersOnly && subscription.memberDiscordChannelId) {
					discordChannel = await client.channels.fetch(subscription.memberDiscordChannelId);
				} else {
					discordChannel = await client.channels.fetch(subscription.discordChannelId!);
				}

				const { result } = await validator.channels.canSendEmbeds(discordChannel);
				if (!(result && discordChannel?.isTextBased())) {
					return;
				}

				let rolePing: string;
				const roleMentions: string[] = [];

				if (membersOnly && subscription.memberRoleId) {
					rolePing = `${roleMention(subscription.memberRoleId)} `;
					roleMentions.push(subscription.memberRoleId);
				} else {
					rolePing = subscription.roleId ? `${roleMention(subscription.roleId)} ` : '';
					if (subscription.roleId) roleMentions.push(subscription.roleId);
				}

				return await discordChannel.send({
					content: subscription.message ?? `${rolePing}${stream.channel.name} is live!`,
					embeds: [embed],
					components: [components],
					allowedMentions: { roles: roleMentions },
				});
			}),
		);

		for (const entry of result) {
			if (entry.status === 'fulfilled' && entry.value) {
				keysToSet.set(this.messageKey(entry.value.id), { channelId: entry.value.channelId });
			}
		}

		if (keysToSet.size > 0) {
			await redis.hmSet(this.messagesKey(stream.id), keysToSet);
		}

		metrics.incrementYoutube({ success: true });
	}

	/**
	 * Update notifications for an ended stream.
	 * @param stream - The YouTube stream
	 * @param messages - The sent notifications
	 */
	private async handleEnded(
		stream: HolodexVideoWithChannel,
		messages: Map<string, { channelId: string }>,
	): Promise<void> {
		const { client, validator } = this.container;

		const fields: APIEmbedField[] = [];
		if (stream.start_actual) {
			fields.push({
				name: 'Duration',
				value: humanizeDuration(Date.now() - new Date(stream.available_at).getTime(), {
					units: ['h', 'm'],
					maxDecimalPoints: 0,
				}),
			});
		}

		const embed = new EmbedBuilder() //
			.setColor(EmbedColors.Grey)
			.setAuthor({
				name: stream.channel.name,
				url: `https://www.youtube.com/channel/${stream.channel.id}`,
			})
			.setTitle(stream.title)
			.setURL(`https://youtu.be/${stream.id}`)
			.setFields(fields)
			.setThumbnail(stream.channel.photo)
			.setImage(`https://i.ytimg.com/vi/${stream.id}/maxresdefault.jpg`);

		await Promise.allSettled(
			Array.from(messages).map(async ([messageId, { channelId }]) => {
				const discordChannel = await client.channels.fetch(channelId);

				const { result } = await validator.channels.canSendEmbeds(discordChannel);
				if (!(result && discordChannel?.isTextBased())) {
					return;
				}

				const message = await discordChannel.messages.fetch(messageId).catch(() => null);

				return await message?.edit({
					content: 'Stream is offline.',
					embeds: [embed],
					components: [],
				});
			}),
		);
	}

	private readonly notificationKey = (streamId: string): string => `youtube:streams:${streamId}:notified`;
	private readonly messagesKey = (streamId: string): string => `youtube:streams:${streamId}:messages`;
	private readonly messageKey = (messageId: string): string => messageId;
}
