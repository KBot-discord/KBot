import type { Channel, PermissionResolvable, Guild } from 'discord.js';

export class ClientValidator {
	public async hasGuildPermissions(guild: Guild, permissions: PermissionResolvable[]) {
		const client = await guild.members.fetchMe();
		for (const permission of permissions) {
			if (client.permissions.has(permission)) {
				return false;
			}
		}
		return true;
	}

	public async hasChannelPermissions(channel: Channel | null, permissionsToCheck: PermissionResolvable[]) {
		if (!channel || channel.isDMBased()) return false;
		const client = await channel.guild.members.fetchMe();
		const channelPermissions = channel.permissionsFor(client);
		for (const permission of permissionsToCheck) {
			if (!channelPermissions.has(permission)) {
				return false;
			}
		}
		return true;
	}
}