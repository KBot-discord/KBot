import { BrandColors, EmbedColors } from '#utils/constants';
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import { ApplyOptions } from '@sapphire/decorators';
import { EmbedBuilder, roleMention } from 'discord.js';
import humanizeDuration from 'humanize-duration';
import { Time } from '@sapphire/duration';
import type { Channel } from 'discord.js';
import type { HolodexVideoWithChannel } from '@kbotdev/holodex';
import type { Key } from '#types/Generic';

@ApplyOptions<ScheduledTask.Options>({
	name: 'youtubeNotify',
	pattern: '0 */1 * * * *' // Every minute
})
export class YoutubeTask extends ScheduledTask {
	private readonly streamsKey = 'youtube:streams:list' as Key;

	public constructor(context: ScheduledTask.Context, options: ScheduledTask.Options) {
		super(context, { ...options });
	}

	public override async run(): Promise<void> {
		const { prisma, holodex, logger, redis, metrics } = this.container;

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

		const liveStreams = await holodex.videos
			.getLive({
				channels: channelIds
			})
			.then((streams) =>
				streams.filter(({ available_at }) => {
					return new Date(available_at).getTime() < Date.now() + Time.Hour;
				})
			);
		metrics.incrementHolodex({ value: 1 });

		const cachedStreams = await redis.hGetValues<HolodexVideoWithChannel>(this.streamsKey);
		const danglingStreams = cachedStreams.filter(({ channel }) => {
			return !channelIds.includes(channel.id);
		});
		const pastStreams = cachedStreams.filter(({ id }) => {
			return !danglingStreams.some((stream) => stream.id === id) && !liveStreams.some((stream) => stream.id === id);
		});

		logger.debug(
			`[YoutubeTask] ${liveStreams.length} live/upcoming streams, ${danglingStreams.length} dangling streams, ${pastStreams.length} past streams`
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

		const keysToDelete: Key[] = [this.streamsKey];

		if (pastStreams.length > 0) {
			await Promise.allSettled(
				pastStreams //
					.filter((stream) => channelIds.includes(stream.channel.id))
					.map(async (stream) => {
						const messages = await redis.hGetAll<{ channelId: string }>(this.messagesKey(stream.id));
						if (messages.size < 1) return;
						return this.handleEnded(stream, messages);
					})
			);

			for (const stream of pastStreams) {
				keysToDelete.push(this.messagesKey(stream.id));
				keysToDelete.push(this.notificationKey(stream.id));
			}
		}

		if (danglingStreams.length > 0) {
			for (const stream of danglingStreams) {
				keysToDelete.push(this.messagesKey(stream.id));
				keysToDelete.push(this.notificationKey(stream.id));
			}
		}

		await redis.deleteMany(keysToDelete);
		await redis.hmSet(
			this.streamsKey,
			new Map<Key, HolodexVideoWithChannel>(
				liveStreams.map((stream) => [stream.id as Key, stream]) //
			)
		);
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

		const keysToSet = new Map<Key, { channelId: string }>();

		const result = await Promise.allSettled(
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

				return discordChannel.send({
					content: subscription.message ?? `${rolePing}${stream.channel.name} is live!`,
					embeds: [embed],
					allowedMentions: { roles: roleMentions }
				});
			})
		);

		for (const entry of result) {
			if (entry.status === 'fulfilled' && entry.value) {
				keysToSet.set(this.messageKey(entry.value.id), { channelId: entry.value.channelId });
			}
		}

		await redis.hmSet(this.messagesKey(stream.id), keysToSet);

		metrics.incrementYoutube({ success: true });
	}

	private async handleEnded(stream: HolodexVideoWithChannel, messages: Map<string, { channelId: string }>) {
		const { client, validator } = this.container;

		const duration = Math.floor(Date.now() - new Date(stream.available_at).getTime());

		const embed = new EmbedBuilder() //
			.setColor(EmbedColors.Grey)
			.setAuthor({
				name: stream.channel.name,
				url: `https://www.youtube.com/channel/${stream.channel.id}`
			})
			.setTitle(stream.title)
			.setURL(`https://youtu.be/${stream.id}`)
			.setFields([
				{ name: 'Duration', value: humanizeDuration(duration) } //
			])
			.setThumbnail(stream.channel.photo)
			.setImage(`https://i.ytimg.com/vi/${stream.id}/maxresdefault.jpg`);

		await Promise.allSettled(
			Array.from(messages).map(async ([messageId, { channelId }]) => {
				const discordChannel = await client.channels.fetch(channelId);

				const { result } = await validator.channels.canSendEmbeds(discordChannel);
				if (!result || !discordChannel || !discordChannel.isTextBased()) {
					return;
				}

				const message = await discordChannel.messages.fetch(messageId).catch(() => null);

				return message?.edit({
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