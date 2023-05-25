import { BadRequestError, UnauthorizedError } from '#rpc/errors';
import { canManageGuild } from '#utils/discord';
import { container } from '@sapphire/framework';
import type { Awaitable, Guild, GuildMember } from 'discord.js';
import type { AuthData } from '@sapphire/plugin-api';

export async function assertManagePermissions<R>(
	guildId: string,
	auth: AuthData,
	callback: (data: { guild: Guild; member: GuildMember; canManage: boolean }) => Awaitable<R>
): Promise<R> {
	const guild = container.client.guilds.cache.get(guildId);
	const member = await guild?.members.fetch(auth.id).catch(() => null);
	if (!guild || !member) throw new BadRequestError();

	const canManage = await canManageGuild(guild, member);
	if (!canManage) throw new UnauthorizedError();

	return callback({
		guild,
		member,
		canManage
	});
}
