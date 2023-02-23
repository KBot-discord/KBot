import { GuildService, GetGuildsResponse, Guild } from '#rpc/bot';
import { getGuildIcon } from '#utils/Discord';
import { createHandler } from '@bufbuild/connect-node';
import { container } from '@sapphire/framework';
import type { Handler } from '@bufbuild/connect-node';

export function getDiscordGuildHandlers(): Handler[] {
	return [getGuildsHandler];
}

export const getGuildsHandler = createHandler(
	GuildService, //
	GuildService.methods.getGuilds,
	async ({ userId }): Promise<GetGuildsResponse> => {
		const { client, core } = container;
		try {
			const guilds: Guild[] = [];

			for (const guild of client.guilds.cache.values()) {
				const member = guild.members.cache.get(userId);
				if (member) {
					const settings = await core.getSettings(guild.id);
					if (settings && member.roles.cache.hasAny(...settings.botManagers)) {
						guilds.push(
							new Guild({
								id: guild.id,
								name: guild.name,
								icon: getGuildIcon(guild),
								owner: member.id === guild.ownerId
							})
						);
					}
				}
			}

			return new GetGuildsResponse({ guilds });
		} catch (err: unknown) {
			container.logger.error(err);
			return new GetGuildsResponse();
		}
	}
);
