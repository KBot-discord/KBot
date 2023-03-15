import { container } from '@sapphire/framework';
import type { CreateMuteData, UpdateMuteData, GuildId, GuildAndMuteId } from '#types/database';
import type { PrismaClient } from '#prisma';
import type { GuildMember } from 'discord.js';
import type { UnmuteUserPayload } from '#types/Tasks';

export class MuteService {
	private readonly database: PrismaClient;

	public constructor() {
		this.database = container.prisma;
	}

	public async isMuted(member: GuildMember, muteRoleId: string): Promise<boolean> {
		return member.roles.cache.has(muteRoleId);
	}

	public async get({ guildId, userId }: GuildAndMuteId) {
		return this.database.mute.findUnique({
			where: { userId_guildId: { userId, guildId } }
		});
	}

	public async getByGuild({ guildId }: GuildId) {
		return this.database.mute.findMany({
			where: { guildId }
		});
	}

	public async create({ guildId, userId }: GuildAndMuteId, { duration, evadeTime }: CreateMuteData) {
		return this.database.mute.create({
			data: { userId, duration, evadeTime, moderationSettings: { connect: { guildId } } }
		});
	}

	public async update({ guildId, userId }: GuildAndMuteId, { evadeTime }: UpdateMuteData) {
		return this.database.mute.update({
			where: { userId_guildId: { userId, guildId } },
			data: { evadeTime }
		});
	}

	public async count({ guildId }: GuildId) {
		return this.database.mute.count({
			where: { guildId }
		});
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

	public deleteTask({ guildId, userId }: GuildAndMuteId) {
		return container.tasks.delete(this.muteJobId(userId, guildId));
	}

	private readonly muteJobId = (userId: string, guildId: string): string => `mute:guilds:${guildId}:user:${userId}`;
}
