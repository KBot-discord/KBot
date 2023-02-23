import { LockedChannelRepository } from '#repositories';
import { container } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import type { GuildTextBasedChannel } from 'discord.js';
import type { NonThreadGuildTextBasedChannelTypes } from '@sapphire/discord.js-utilities';
import type { UnlockChannelPayload } from '#types/Tasks';
import type { CreateLockedChannelData } from '#types/repositories';

export class LockedChannelSubmodule {
	private readonly repository: LockedChannelRepository;

	public constructor() {
		this.repository = new LockedChannelRepository();
	}

	public async fetch(channelId: string) {
		return this.repository.findOne({ channelId });
	}

	public async fetchByGuildId(guildId: string) {
		return this.repository.findMany({ guildId });
	}

	public async create(channelId: string, data: CreateLockedChannelData) {
		return this.repository.create({ channelId }, data);
	}

	public async delete(channelId: string) {
		return this.repository.delete({ channelId });
	}

	public async count(guildId: string) {
		return this.repository.count({ guildId });
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
