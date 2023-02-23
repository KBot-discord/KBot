import { container } from '@sapphire/framework';
import type { PrismaClient } from '#prisma';
import type { LockedChannelById, QueryByGuildId, CreateLockedChannelData } from '#types/repositories';

export class LockedChannelRepository {
	private readonly database: PrismaClient;

	public constructor() {
		this.database = container.prisma;
	}

	public async findOne({ channelId }: LockedChannelById) {
		return this.database.lockedChannel.findUnique({
			where: { id: channelId }
		});
	}

	public async findMany({ guildId }: QueryByGuildId) {
		return this.database.lockedChannel.findMany({
			where: { guildId }
		});
	}

	public async create({ channelId }: LockedChannelById, { duration, guildId, roleId }: CreateLockedChannelData) {
		return this.database.lockedChannel.create({
			data: { id: channelId, duration, roleId, moderationSettings: { connect: { guildId } } }
		});
	}

	public async delete({ channelId }: LockedChannelById) {
		return this.database.lockedChannel
			.delete({
				where: { id: channelId }
			})
			.catch(() => null);
	}

	public async count({ guildId }: QueryByGuildId) {
		return this.database.lockedChannel.count({
			where: { guildId }
		});
	}
}
