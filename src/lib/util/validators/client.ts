import type { PermissionResolvable, Guild } from 'discord.js';

export class ClientValidator {
	public async hasPermissions(guild: Guild, permissions: PermissionResolvable[]) {
		const client = await guild.members.fetchMe();
		for (const permission of permissions) {
			if (client.permissions.has(permission)) {
				return false;
			}
		}
		return true;
	}
}
