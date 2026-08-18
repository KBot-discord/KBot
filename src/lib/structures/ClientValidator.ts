import type { Channel, Guild, PermissionResolvable } from 'discord.js';

export class ClientValidator {
	/**
	 * Checks if the bot has the provided permissions in the guild.
	 * @param guild - The guild
	 * @param permissions - The permissions to check
	 */
	public async hasGuildPermissions(guild: Guild, permissions: PermissionResolvable[]): Promise<boolean> {
		const client = await guild.members.fetchMe();
		for (const permission of permissions) {
			if (client.permissions.has(permission)) {
				return false;
			}
		}
		return true;
	}

	/**
	 * Checks if the bot has the provided permissions in the channel.
	 * @param channel - The channel
	 * @param permissions - The permissions to check
	 */
	public async hasChannelPermissions(channel: Channel | null, permissions: PermissionResolvable[]): Promise<boolean> {
		if (!channel || channel.isDMBased()) return false;
		const client = await channel.guild.members.fetchMe();
		const channelPermissions = channel.permissionsFor(client);
		for (const permission of permissions) {
			if (!channelPermissions.has(permission)) {
				return false;
			}
		}
		return true;
	}
}
