import { container } from '@sapphire/framework';
import type { PrismaClient } from '#prisma';
import type { QueryByGuildId, UpdateMuteData, CreateMuteData, MuteByIdAndGuildId } from '#types/repositories';

export class MuteRepository {
	private readonly database: PrismaClient;

	public constructor() {
		this.database = container.prisma;
	}

	public async findOne({ userId, guildId }: MuteByIdAndGuildId) {
		return this.database.mute.findUnique({
			where: { userId_guildId: { userId, guildId } }
		});
	}

	public async findManyByGuild({ guildId }: QueryByGuildId) {
		return this.database.mute.findMany({
			where: { guildId }
		});
	}

	public async create({ userId, guildId }: MuteByIdAndGuildId, { duration, evadeTime }: CreateMuteData) {
		return this.database.mute.create({
			data: { userId, duration, evadeTime, moderationSettings: { connect: { guildId } } }
		});
	}

	public async update({ userId, guildId }: MuteByIdAndGuildId, { evadeTime }: UpdateMuteData) {
		return this.database.mute.update({
			where: { userId_guildId: { userId, guildId } },
			data: { evadeTime }
		});
	}

	public async delete({ userId, guildId }: MuteByIdAndGuildId) {
		return this.database.mute
			.delete({
				where: { userId_guildId: { userId, guildId } }
			})
			.catch(() => null);
	}

	public async count({ guildId }: QueryByGuildId) {
		return this.database.mute.count({
			where: { guildId }
		});
	}
}
