import { container } from '@sapphire/framework';
import type { PrismaClient, Poll, PollUser } from '#prisma';
import type { CreatePollData, PollById, PollByIdAndGuildId, PollWithUsers, UpdatePollUserData, QueryByGuildId } from '#types/repositories';

export class PollRepository {
	private readonly database: PrismaClient;

	public constructor() {
		this.database = container.prisma;
	}

	public async findOne({ pollId }: PollById): Promise<PollWithUsers | null> {
		return this.database.poll.findUnique({
			where: { id: pollId },
			include: { users: true }
		});
	}

	public async findMany({ guildId }: QueryByGuildId): Promise<PollWithUsers[]> {
		return this.database.poll.findMany({
			where: { guildId },
			include: { users: true }
		});
	}

	public async create({ pollId, guildId }: PollByIdAndGuildId, { title, channelId, time, options }: CreatePollData): Promise<Poll> {
		return this.database.poll.create({
			data: {
				id: pollId,
				title,
				channelId,
				time,
				options,
				utilitySettings: { connect: { guildId } }
			}
		});
	}

	public async delete({ pollId }: PollById): Promise<Poll | null> {
		return this.database.poll
			.delete({
				where: { id: pollId }
			})
			.catch(() => null);
	}

	public async upsertUser({ userId, pollId, option }: UpdatePollUserData): Promise<PollUser> {
		return this.database.pollUser.upsert({
			where: { id_pollId: { id: userId, pollId } },
			update: { option },
			create: { id: userId, option, pollId }
		});
	}

	public async count({ guildId }: QueryByGuildId): Promise<number> {
		return this.database.poll.count({
			where: { guildId }
		});
	}
}
