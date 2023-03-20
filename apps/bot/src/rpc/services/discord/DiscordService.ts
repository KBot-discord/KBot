import { authenticated } from '#rpc/middlewares';
import { canManageGuild, getGuildIcon, getUserAvatarUrl } from '#utils/Discord';
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
import { isNullish } from '@sapphire/utilities';
import { ChannelType } from 'discord.js';
import { Code, ConnectError, HandlerContext } from '@bufbuild/connect';
import type { ServiceImpl, ConnectRouter } from '@bufbuild/connect';

export function registerDiscordService(router: ConnectRouter) {
	router.service(DiscordService, new DiscordServiceImpl());
}

class DiscordServiceImpl implements ServiceImpl<typeof DiscordService> {
	@authenticated()
	public async getDiscordGuilds(_req: GetDiscordGuildsRequest, { auth, error }: HandlerContext): Promise<GetDiscordGuildsResponse> {
		const { logger, client } = container;
		if (error) throw error;
		if (!auth) throw new ConnectError('Unauthenticated', Code.Unauthenticated);

		try {
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
		} catch (err: unknown) {
			logger.error(err);
			throw new ConnectError('Internal server error.', Code.Internal);
		}
	}

	@authenticated()
	public async getDiscordTextChannels(
		{ guildId }: GetDiscordTextChannelsRequest,
		{ auth, error }: HandlerContext
	): Promise<GetDiscordTextChannelsResponse> {
		const { logger, client } = container;
		if (error) throw error;
		if (!auth) throw new ConnectError('Unauthenticated', Code.Unauthenticated);

		const guild = client.guilds.cache.get(guildId);
		const member = await guild?.members.fetch(auth.id).catch(() => null);
		if (!guild || !member) throw new ConnectError('Bad request', Code.Aborted);

		const canManage = await canManageGuild(guild, member);
		if (!canManage) throw new ConnectError('Unauthorized', Code.PermissionDenied);

		try {
			const fetchedChannels = await guild.channels.fetch();
			const channels = fetchedChannels
				.filter((channel) => {
					return !isNullish(channel) && (channel.type === ChannelType.GuildText || channel.type === ChannelType.GuildAnnouncement);
				})
				.map((channel) => new DiscordChannel({ id: channel!.id, name: channel!.name, position: channel!.position }));

			return new GetDiscordTextChannelsResponse({ channels });
		} catch (err: unknown) {
			logger.error(err);
			throw new ConnectError('Internal server error.', Code.Internal);
		}
	}

	@authenticated()
	public async getDiscordVoiceChannels(
		{ guildId }: GetDiscordVoiceChannelsRequest,
		{ auth, error }: HandlerContext
	): Promise<GetDiscordVoiceChannelsResponse> {
		const { logger, client } = container;
		if (error) throw error;
		if (!auth) throw new ConnectError('Unauthenticated', Code.Unauthenticated);

		const guild = client.guilds.cache.get(guildId);
		const member = await guild?.members.fetch(auth.id).catch(() => null);
		if (!guild || !member) throw new ConnectError('Bad request', Code.Aborted);

		const canManage = await canManageGuild(guild, member);
		if (!canManage) throw new ConnectError('Unauthorized', Code.PermissionDenied);

		try {
			const channelCollection = await guild.channels.fetch();
			const channels = channelCollection
				.filter((channel) => {
					return !isNullish(channel) && (channel!.type === ChannelType.GuildVoice || channel!.type === ChannelType.GuildStageVoice);
				})
				.map((channel) => new DiscordChannel({ id: channel!.id, name: channel!.name, position: channel!.position }));

			return new GetDiscordVoiceChannelsResponse({ channels });
		} catch (err: unknown) {
			logger.error(err);
			throw new ConnectError('Internal server error', Code.Internal);
		}
	}

	@authenticated()
	public async getDiscordRoles({ guildId }: GetDiscordRolesRequest, { auth, error }: HandlerContext): Promise<GetDiscordRolesResponse> {
		const { logger, client } = container;
		if (error) throw error;
		if (!auth) throw new ConnectError('Unauthenticated', Code.Unauthenticated);

		const guild = client.guilds.cache.get(guildId);
		const member = await guild?.members.fetch(auth.id).catch(() => null);
		if (!guild || !member) throw new ConnectError('Bad request', Code.Aborted);

		const canManage = await canManageGuild(guild, member);
		if (!canManage) throw new ConnectError('Unauthorized', Code.PermissionDenied);

		try {
			const fetchedRoles = await guild.roles.fetch();
			const roles = fetchedRoles //
				.map(({ id, name, position, color }) => {
					return new DiscordRole({ id, name, position, color: `${color}` });
				});

			return new GetDiscordRolesResponse({ roles });
		} catch (err: unknown) {
			logger.error(err);
			throw new ConnectError('Internal server error', Code.Internal);
		}
	}

	@authenticated()
	public async getDiscordUser(_req: GetDiscordUserRequest, { auth, error }: HandlerContext): Promise<GetDiscordUserResponse> {
		const { logger, client } = container;
		if (error) throw error;
		if (!auth) throw new ConnectError('Unauthenticated', Code.Unauthenticated);

		const user = await client.users.fetch(auth.id).catch(() => null);
		if (!user) throw new ConnectError('Unauthenticated', Code.Unauthenticated);

		try {
			const avatar = getUserAvatarUrl(user);

			const discordUser = new DiscordUser({
				id: user.id,
				username: user.username,
				discriminator: user.discriminator,
				avatar
			});

			return new GetDiscordUserResponse({ user: discordUser });
		} catch (err: unknown) {
			logger.error(err);
			throw new ConnectError('Internal server error', Code.Internal);
		}
	}
}
