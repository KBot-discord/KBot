import { createChannelService, GetTextChannelsResponse, GetVoiceChannelsResponse } from '../../gen/discord/channels/v1/channels.pb';
import { container } from '@sapphire/framework';

export const channelHandler = createChannelService({
	GetTextChannels: async ({ guildId }): Promise<GetTextChannelsResponse> => {
		const guild = await container.client.guilds.fetch(guildId);
		const channelCollection = await guild.channels.fetch();
		const channels = channelCollection
			.filter((channel) => Boolean(channel) && (channel!.type === 'GUILD_TEXT' || channel!.type === 'GUILD_NEWS'))
			.map((ch) => ({ id: ch!.id, name: ch!.name, position: ch!.position }));
		return { channels };
	},
	GetVoiceChannels: async ({ guildId }): Promise<GetVoiceChannelsResponse> => {
		const guild = await container.client.guilds.fetch(guildId);
		const channelCollection = await guild.channels.fetch();
		const channels = channelCollection
			.filter((channel) => Boolean(channel) && (channel!.type === 'GUILD_VOICE' || channel!.type === 'GUILD_STAGE_VOICE'))
			.map((ch) => ({ id: ch!.id, name: ch!.name, position: ch!.position }));
		return { channels };
	}
});
