import { BrandColors, FooterIcon } from '#utils/constants';
import { VideoStatus } from '#prisma';
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import { ApplyOptions } from '@sapphire/decorators';
import { isNullish } from '@sapphire/utilities';
import { Collection, EmbedBuilder } from 'discord.js';
import dayjs from 'dayjs';
import humanizeDuration from 'humanize-duration';
import type { APIEmbedField } from 'discord-api-types/v10';
import type { YoutubeChannel, YoutubeVideo } from '#prisma';

interface CompareYoutubeVideos {
	old: YoutubeVideo;
	new: YoutubeVideo;
}

@ApplyOptions<ScheduledTask.Options>({
	pattern: '0 */1 * * * *', // Every minute
	enabled: false
})
export class PremiumTask extends ScheduledTask {
	public constructor(context: ScheduledTask.Context, options: ScheduledTask.Options) {
		super(context, { ...options });
	}

	public override async run(): Promise<void> {
		const { youtube } = this.container;

		const videos = await youtube.videos.getUpcoming();
		if (videos.length === 0) {
			this.container.logger.debug('[CheckUpcomingTask] No videos found in database.');
			return;
		}

		const fetchedVideos = await youtube.api.fetchVideos(videos.map(({ id }) => id));
		if (isNullish(fetchedVideos) || fetchedVideos.length === 0) {
			this.container.logger.debug('[CheckUpcomingTask] No videos fetched from the API.');
			return;
		}
		this.container.logger.debug(`[CheckUpcomingTask] ${fetchedVideos.length} videos fetched from the API.`);

		const updatedVideos = await youtube.videos.upsertMany(fetchedVideos);

		this.container.logger.debug(`[CheckUpcomingTask] Updated ${updatedVideos?.length} videos.`);

		// Collection<video id, [old video, new video]>
		const videoData = new Collection<string, CompareYoutubeVideos>();
		for (const oldVideo of videos) {
			let object: CompareYoutubeVideos | undefined = undefined;
			for (const newVideo of updatedVideos) {
				if (oldVideo.id === newVideo.id) {
					object = { old: oldVideo, new: newVideo };
					break;
				}
			}
			if (!object) continue;
			videoData.set(oldVideo.id, object);
		}

		for (const video of videoData.values()) {
			if (video.old.status === VideoStatus.UPCOMING && video.new.status === VideoStatus.LIVE) {
				await this.handleLive(video.new);
			} else if (video.old.status === VideoStatus.LIVE && video.new.status === VideoStatus.PAST) {
				await this.handleEnded(video.new);
			}
		}
	}

	private async handleLive(video: YoutubeVideo): Promise<void> {
		const { client, youtube, validator, metrics, logger } = this.container;

		const subscriptions = await youtube.subscriptions.getValid({
			channelId: video.channelId
		});
		if (subscriptions.length === 0) {
			logger.warn('[CheckUpcomingTask] There were 0 subscriptions for a stream notification.');
			metrics.incrementYoutube({ success: false });
			return;
		}

		const channel = await youtube.channels.get({
			channelId: video.channelId
		});
		if (isNullish(channel)) {
			logger.warn('[CheckUpcomingTask] Channel was null for stream notification.');
			metrics.incrementYoutube({ success: false });
			return;
		}

		const embed = this.createLiveEmbed(channel, video);

		const result = await Promise.allSettled(
			subscriptions.map(async (subscription) => {
				// discordChannelId was queried to not be null
				const discordChannel = await client.channels.fetch(subscription.discordChannelId!);

				const { result } = await validator.channels.canSendEmbeds(discordChannel);
				if (!result || !discordChannel || !discordChannel.isTextBased()) {
					return;
				}

				return discordChannel.send({
					content: `${channel.name} is live!`,
					embeds: [embed],
					allowedMentions: { roles: subscription.roleId ? [subscription.roleId] : [] }
				});
			})
		);

		metrics.incrementYoutube({ success: true });
		const successMessages = result.filter((entry) => entry.status === 'fulfilled');

		logger.debug(`[CheckUpcomingTask] ${successMessages.length}/${result.length} live notifications were a success.`);
	}

	private async handleEnded(video: YoutubeVideo) {
		const { client, youtube, validator } = this.container;

		const messages = await youtube.messages.getByVideo({
			videoId: video.id
		});

		const channel = await youtube.channels.get({
			channelId: video.channelId
		});
		if (isNullish(channel)) {
			this.container.logger.warn('[CheckUpcomingTask] Channel was null for stream end.');
			return;
		}

		const embed = this.createEndEmbed(channel, video);

		const result = await Promise.allSettled(
			messages.map(async (message) => {
				// discordChannelId was queried to not be null
				const discordChannel = await client.channels.fetch(message.discordChannelId);

				const { result } = await validator.channels.canSendEmbeds(discordChannel);
				if (!result || !discordChannel || !discordChannel.isTextBased()) return;

				const fetchedMessage = await discordChannel.messages.fetch(message.id);

				return fetchedMessage.edit({
					content: `${channel.name}'s stream is over.`,
					embeds: [embed]
				});
			})
		);

		const successMessages = result.filter((entry) => entry.status === 'fulfilled');

		this.container.logger.warn(`[CheckUpcomingTask] ${successMessages.length}/${result.length} end notifications were a success.`);
	}

	private createLiveEmbed(channel: YoutubeChannel, video: YoutubeVideo): EmbedBuilder {
		return new EmbedBuilder() //
			.setColor(BrandColors.Youtube)
			.setAuthor({ name: channel.name, iconURL: channel.image, url: `https://www.youtube.com/${channel.id}` })
			.setTitle(video.title)
			.setImage(video.thumbnail)
			.setFooter({ text: 'Powered by KBot', iconURL: FooterIcon });
	}

	private createEndEmbed(channel: YoutubeChannel, video: YoutubeVideo): EmbedBuilder {
		const fields: APIEmbedField[] = [];

		// TODO: more stats?
		if (video.actualStartTime && video.actualEndTime) {
			const diff = dayjs(video.actualEndTime).diff(video.actualStartTime);
			const streamLengthString = humanizeDuration(diff);
			fields.push({
				name: 'Stream length',
				value: streamLengthString,
				inline: true
			});
		}

		return new EmbedBuilder() //
			.setColor(BrandColors.Youtube)
			.setAuthor({ name: channel.name, iconURL: channel.image, url: `https://www.youtube.com/${channel.id}` })
			.setTitle(video.title)
			.setFields(fields)
			.setImage(video.thumbnail)
			.setFooter({ text: 'Powered by KBot', iconURL: FooterIcon });
	}
}
