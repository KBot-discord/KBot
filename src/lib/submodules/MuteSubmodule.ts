import { MuteRepository } from '#repositories';
import { container } from '@sapphire/framework';
import type { GuildMember } from 'discord.js';
import type { UnmuteUserPayload } from '#types/Tasks';

export class MuteSubmodule {
	private readonly repository: MuteRepository;

	public constructor() {
		this.repository = new MuteRepository();
	}

	public async isMuted(member: GuildMember, muteRoleId: string): Promise<boolean> {
		return member.roles.cache.has(muteRoleId);
	}

	public async fetch(userId: string, guildId: string) {
		return this.repository.findOne({ userId, guildId });
	}

	public async fetchByGuildId(guildId: string) {
		return this.repository.findManyByGuild({ guildId });
	}

	public async updateEvade(userId: string, guildId: string, evadeTime: bigint) {
		return this.repository.update({ userId, guildId }, { evadeTime });
	}

	public async count(guildId: string) {
		return this.repository.count({ guildId });
	}

	public createTask(expiresIn: number, { guildId, userId }: UnmuteUserPayload) {
		container.tasks.create(
			'unmuteUser',
			{ guildId, userId },
			{
				customJobOptions: {
					jobId: this.muteJobId(userId, guildId)
				},
				repeated: false,
				delay: expiresIn
			}
		);
	}

	public deleteTask(userId: string, guildId: string) {
		return container.tasks.delete(this.muteJobId(userId, guildId));
	}

	private readonly muteJobId = (userId: string, guildId: string): string => `mute:guilds:${guildId}:user:${userId}`;
}
