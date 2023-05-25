import { authenticated, catchServerError } from '#rpc/middlewares';
import { canManageGuild, getGuildIcon, getUserAvatarUrl } from '#utils/discord';
import { UnauthenticatedError } from '#rpc/errors';
import { assertManagePermissions } from '#rpc/utils';
import { isNullOrUndefined } from '#utils/functions';
import {
	DiscordGuild,
	DiscordChannel,
	DiscordRole,
	DiscordUser,
	GetDiscordGuildsResponse,
	GetDiscordTextChannelsResponse,
	GetDiscordVoiceChannelsResponse,
	GetDiscordRolesResponse,
	GetDiscordUserResponse,
	DiscordService,
	GetDiscordGuildsRequest,
	GetDiscordTextChannelsRequest,
	GetDiscordVoiceChannelsRequest,
	GetDiscordRolesRequest,
	GetDiscordUserRequest
} from '@kbotdev/proto';
import { container } from '@sapphire/framework';
import { ChannelType } from 'discord.js';
import * as connect from '@bufbuild/connect';
import type { ServiceImpl, ConnectRouter } from '@bufbuild/connect';

export function registerDiscordService(router: ConnectRouter): void {
	router.service(DiscordService, new DiscordServiceImpl());
}

class DiscordServiceImpl implements ServiceImpl<typeof DiscordService> {
	@authenticated()
	@catchServerError()
	public async getDiscordGuilds(_req: GetDiscordGuildsRequest, { auth }: connect.HandlerContext): Promise<GetDiscordGuildsResponse> {
		const { client } = container;

		const guilds: DiscordGuild[] = [];

		for (const guild of client.guilds.cache.values()) {
			const member = await guild.members.fetch(auth.id).catch(() => null);

			if (member) {
				const canManage = await canManageGuild(guild, member);

				if (canManage) {
					guilds.push(
						new DiscordGuild({
							id: guild.id,
							name: guild.name,
							icon: getGuildIcon(guild),
							canManage
						})
					);
				}
			}
		}

		return new GetDiscordGuildsResponse({ guilds });
	}

	@authenticated()
	@catchServerError()
	public async getDiscordTextChannels(
		{ guildId }: GetDiscordTextChannelsRequest,
		{ auth }: connect.HandlerContext
	): Promise<GetDiscordTextChannelsResponse> {
		return assertManagePermissions(guildId, auth, async ({ guild }) => {
			const fetchedChannels = await guild.channels.fetch();

			const channels = fetchedChannels
				.filter((channel) => {
					return !isNullOrUndefined(channel) && (channel.type === ChannelType.GuildText || channel.type === ChannelType.GuildAnnouncement);
				})
				.map(
					(channel) =>
						new DiscordChannel({
							id: channel!.id,
							name: channel!.name,
							position: channel!.position
						})
				);

			return new GetDiscordTextChannelsResponse({ channels });
		});
	}

	@authenticated()
	@catchServerError()
	public async getDiscordVoiceChannels(
		{ guildId }: GetDiscordVoiceChannelsRequest,
		{ auth }: connect.HandlerContext
	): Promise<GetDiscordVoiceChannelsResponse> {
		return assertManagePermissions(guildId, auth, async ({ guild }) => {
			const channelCollection = await guild.channels.fetch();
			const channels = channelCollection
				.filter((channel) => {
					return !isNullOrUndefined(channel) && (channel.type === ChannelType.GuildVoice || channel.type === ChannelType.GuildStageVoice);
				})
				.map(
					(channel) =>
						new DiscordChannel({
							id: channel!.id,
							name: channel!.name,
							position: channel!.position
						})
				);

			return new GetDiscordVoiceChannelsResponse({ channels });
		});
	}

	@authenticated()
	@catchServerError()
	public async getDiscordRoles({ guildId }: GetDiscordRolesRequest, { auth }: connect.HandlerContext): Promise<GetDiscordRolesResponse> {
		return assertManagePermissions(guildId, auth, async ({ guild }) => {
			const fetchedRoles = await guild.roles.fetch();
			const roles = fetchedRoles //
				.map(({ id, name, position, color }) => {
					return new DiscordRole({ id, name, position, color: `${color}` });
				});

			return new GetDiscordRolesResponse({ roles });
		});
	}

	@authenticated()
	@catchServerError()
	public async getDiscordUser(_req: GetDiscordUserRequest, { auth }: connect.HandlerContext): Promise<GetDiscordUserResponse> {
		const { client } = container;

		const user = await client.users.fetch(auth.id).catch(() => null);
		if (!user) throw new UnauthenticatedError();

		const avatar = getUserAvatarUrl(user);

		const discordUser = new DiscordUser({
			id: user.id,
			username: user.username,
			avatar
		});

		return new GetDiscordUserResponse({ user: discordUser });
	}
}
