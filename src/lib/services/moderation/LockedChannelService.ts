import { container } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import type { GuildId, LockedChannelId, CreateLockedChannelData } from '#types/database';
import type { PrismaClient } from '#prisma';
import type { GuildTextBasedChannel } from 'discord.js';
import type { NonThreadGuildTextBasedChannelTypes } from '@sapphire/discord.js-utilities';
import type { UnlockChannelPayload } from '#types/Tasks';

export class LockedChannelService {
	private readonly database: PrismaClient;

	public constructor() {
		this.database = container.prisma;
	}

	public async get({ discordChannelId }: LockedChannelId) {
		return this.database.lockedChannel.findUnique({
			where: { id: discordChannelId }
		});
	}

	public async getByGuild({ guildId }: GuildId) {
		return this.database.lockedChannel.findMany({
			where: { guildId }
		});
	}

	public async create(data: CreateLockedChannelData) {
		return this.database.lockedChannel.create({
			data
		});
	}

	public async delete({ discordChannelId }: LockedChannelId) {
		return this.database.lockedChannel
			.delete({
				where: { id: discordChannelId }
			})
			.catch(() => null);
	}

	public async count({ guildId }: GuildId) {
		return this.database.lockedChannel.count({
			where: { guildId }
		});
	}

	public createTask(expiresIn: number, { channelId }: UnlockChannelPayload) {
		container.tasks.create(
			'unlockChannel',
			{ channelId },
			{
				customJobOptions: {
					jobId: this.lockedChannelJobId(channelId)
				},
				repeated: false,
				delay: expiresIn
			}
		);
	}

	public deleteTask(channelId: string) {
		return container.tasks.delete(this.lockedChannelJobId(channelId));
	}

	public async setChannelMessagePermissions(channel: GuildTextBasedChannel, roleId: string, value: boolean | null) {
		const reason = value ? 'Channel unlock' : 'Channel lock';

		if (channel.isThread()) {
			if (isNullish(channel.parent)) {
				const parent = (await container.client.channels.fetch(channel.parentId!)) as NonThreadGuildTextBasedChannelTypes;
				await parent.permissionOverwrites.edit(
					roleId, //
					{ SendMessagesInThreads: value },
					{ reason }
				);
			} else {
				await channel.parent.permissionOverwrites.edit(
					roleId, //
					{ SendMessagesInThreads: value },
					{ reason }
				);
			}
		} else {
			await channel.permissionOverwrites.edit(
				roleId, //
				{ SendMessages: value },
				{ reason }
			);
		}
	}

	private readonly lockedChannelJobId = (channelId: string) => `unlocks:${channelId}`;
}
