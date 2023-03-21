import { BrandColors, EmbedColors } from '#utils/constants';
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import { ApplyOptions } from '@sapphire/decorators';
import { EmbedBuilder, roleMention } from 'discord.js';
import { Time } from '@sapphire/duration';
import humanizeDuration from 'humanize-duration';
import type { Channel } from 'discord.js';
import type { HolodexVideoWithChannel } from '@kbotdev/holodex';
import type { Key } from '#types/Generic';

@ApplyOptions<ScheduledTask.Options>({
	name: 'youtubeNotify',
	pattern: '0 */1 * * * *' // Every minute
})
export class YoutubeTask extends ScheduledTask {
	public constructor(context: ScheduledTask.Context, options: ScheduledTask.Options) {
		super(context, { ...options });
	}

	public override async run(): Promise<void> {
		const { prisma, holodex, logger, redis } = this.container;

		logger.debug('[YoutubeTask] Checking subscriptions');

		const channelIds = await prisma.youtubeSubscription
			.groupBy({
				where: {
					AND: {
						NOT: { discordChannelId: null },
						youtubeSettings: { enabled: true }
					}
				},
				by: ['channelId']
			})
			.then((res) => res.map(({ channelId }) => channelId));
		if (channelIds.length < 1) return;

		const liveStreams = await holodex.videos.getLive({
			channels: channelIds
		});

		logger.debug(`[YoutubeTask] Sending notifications for ${liveStreams.length} streams`);

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

		let page = 0;
		let totalItems = 9999;
		const pastStreams: HolodexVideoWithChannel[] = [];

		logger.debug(`[YoutubeTask] Fetching past streams`);

		const fetchPastStreams = async () => {
			const now = Date.now();
			const response = await holodex.videos.getPastPaginated({
				from: now - Time.Hour,
				to: now,
				offset: page * 100
			});

			pastStreams.push(...response.items);

			page++;
			totalItems = response.total;
		};

		for (let i = 1; i * 100 < totalItems; i++) {
			await fetchPastStreams();
		}

		logger.debug(`[YoutubeTask] Fetched ${pastStreams.length} past streams (pages: ${page})`);
		if (pastStreams.length < 1) return;

		await Promise.allSettled(
			pastStreams //
				.filter((stream) => channelIds.includes(stream.channel.id))
				.map(async (stream) => {
					const messages = await redis.hGetAll<{ channelId: string }>(this.messagesKey(stream.id));
					return this.handleEnded(stream, messages);
				})
		);

		const keysToDelete: Key[] = [];
		for (const stream of pastStreams) {
			keysToDelete.push(`youtube:streams:${stream.id}:notified` as Key);
			keysToDelete.push(this.messagesKey(stream.id));
		}

		await redis.deleteMany(keysToDelete);
	}

	private async handleLive(stream: HolodexVideoWithChannel) {
		const { client, youtube, validator, metrics, logger, redis } = this.container;

		logger.debug(`[YoutubeTask] Sending notification for ${stream.title}`);

		const membersOnly = stream.topic_id === 'membersonly';
		const subscriptions = await youtube.subscriptions.getValid({
			channelId: stream.channel.id
		});

		const embed = new EmbedBuilder() //
			.setColor(BrandColors.Youtube)
			.setAuthor({
				name: stream.channel.name,
				url: `https://www.youtube.com/channel/${stream.channel.id}`
			})
			.setTitle(stream.title)
			.setURL(`https://youtu.be/${stream.id}`)
			.setThumbnail(stream.channel.photo)
			.setImage(`https://i.ytimg.com/vi/${stream.id}/maxresdefault.jpg`);

		await Promise.allSettled(
			subscriptions.map(async (subscription) => {
				let discordChannel: Channel | null;
				if (membersOnly && subscription.memberDiscordChannelId) {
					discordChannel = await client.channels.fetch(subscription.memberDiscordChannelId);
				} else {
					discordChannel = await client.channels.fetch(subscription.discordChannelId!);
				}

				const { result } = await validator.channels.canSendEmbeds(discordChannel);
				if (!result || !discordChannel || !discordChannel.isTextBased()) {
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

				const message = await discordChannel.send({
					content: `${rolePing}${stream.channel.name} is live!`,
					embeds: [embed],
					allowedMentions: { roles: roleMentions }
				});

				return redis.hSet<{ channelId: string }>(
					this.messagesKey(stream.id), //
					this.messageKey(message.id),
					{ channelId: message.channelId }
				);
			})
		);

		metrics.incrementYoutube({ success: true });
	}

	private async handleEnded(stream: HolodexVideoWithChannel, messages: Map<string, { channelId: string }>) {
		const { client, validator } = this.container;

		if (messages.size < 1) return;

		const embed = new EmbedBuilder() //
			.setColor(EmbedColors.Grey)
			.setAuthor({
				name: stream.channel.name,
				url: `https://www.youtube.com/channel/${stream.channel.id}`
			})
			.setTitle(stream.title)
			.setURL(`https://youtu.be/${stream.id}`)
			.setFields([
				{ name: 'Duration', value: humanizeDuration(stream.duration) } //
			])
			.setThumbnail(stream.channel.photo)
			.setImage(`https://i.ytimg.com/vi/${stream.id}/maxresdefault.jpg`);

		await Promise.allSettled(
			Array.from(messages).map(async ([messageId, channel]) => {
				const discordChannel = await client.channels.fetch(channel.channelId);

				const { result } = await validator.channels.canSendEmbeds(discordChannel);
				if (!result || !discordChannel || !discordChannel.isTextBased()) {
					return;
				}

				const message = await discordChannel.messages.fetch(messageId);

				return message.edit({
					content: 'Stream is offline.',
					embeds: [embed]
				});
			})
		);
	}

	private readonly notificationKey = (streamId: string) => `youtube:streams:${streamId}:notified` as Key;
	private readonly messagesKey = (streamId: string) => `youtube:streams:${streamId}:messages` as Key;
	private readonly messageKey = (messageId: string) => messageId as Key;
}
