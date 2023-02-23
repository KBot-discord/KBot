import { ChannelService, GetVoiceChannelsResponse, GetTextChannelsResponse, Channel } from '#rpc/bot';
import { container } from '@sapphire/framework';
import { ChannelType } from 'discord.js';
import { createHandler } from '@bufbuild/connect-node';
import { isNullish } from '@sapphire/utilities';
import type { Handler } from '@bufbuild/connect-node';

export function getDiscordChannelHandlers(): Handler[] {
	return [textChannelHandler, voiceChannelHandler];
}

export const textChannelHandler = createHandler(
	ChannelService, //
	ChannelService.methods.getTextChannels,
	async ({ guildId }): Promise<GetTextChannelsResponse> => {
		try {
			const guild = await container.client.guilds.fetch(guildId);

			const fetchedChannels = await guild.channels.fetch();
			const channels = fetchedChannels
				.filter((channel) => {
					return !isNullish(channel) && (channel.type === ChannelType.GuildText || channel.type === ChannelType.GuildAnnouncement);
				})
				.map((channel) => new Channel({ id: channel!.id, name: channel!.name, position: channel!.position }));

			return new GetVoiceChannelsResponse({ channels });
		} catch (err: unknown) {
			container.logger.error(err);
			return new GetTextChannelsResponse();
		}
	}
);

export const voiceChannelHandler = createHandler(
	ChannelService, //
	ChannelService.methods.getTextChannels,
	async ({ guildId }): Promise<GetVoiceChannelsResponse> => {
		try {
			const guild = await container.client.guilds.fetch(guildId);

			const channelCollection = await guild.channels.fetch();
			const channels = channelCollection
				.filter((channel) => {
					return !isNullish(channel) && (channel!.type === ChannelType.GuildVoice || channel!.type === ChannelType.GuildStageVoice);
				})
				.map((channel) => new Channel({ id: channel!.id, name: channel!.name, position: channel!.position }));

			return new GetVoiceChannelsResponse({ channels });
		} catch (err: unknown) {
			container.logger.error(err);
			return new GetVoiceChannelsResponse();
		}
	}
);
