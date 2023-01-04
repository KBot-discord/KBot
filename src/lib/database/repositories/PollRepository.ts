import { container } from '@sapphire/framework';
import type { Message } from 'discord.js';
import type { Poll, PollUser } from '@prisma/client';

export class PollRepository {
	public async createPoll(message: Message, title: string, options: string[], expiresAt: number): Promise<Poll | null> {
		return container.db.poll.create({
			data: {
				id: message.id,
				title,
				channel: message.channelId,
				time: expiresAt,
				options,
				utility: { connect: { id: message.guildId! } }
			}
		});
	}

	public async getPoll(messageId: string): Promise<Poll | null> {
		return container.db.poll.findUnique({ where: { id: messageId } });
	}

	public async getPollWithUsers(messageId: string): Promise<(Poll & { users: PollUser[] }) | null> {
		return container.db.poll.findUnique({
			where: { id: messageId },
			include: { users: true }
		});
	}

	public async getPollsWithUsers(guildId: string): Promise<(Poll & { users: PollUser[] })[] | null> {
		return container.db.poll.findMany({
			where: { guildId },
			include: { users: true }
		});
	}

	public async deletePoll(messageId: string): Promise<Poll | null> {
		return container.db.poll.delete({ where: { id: messageId } });
	}

	public async updatePollUser(userId: string, messageId: string, option: number): Promise<PollUser | null> {
		return container.db.pollUser.upsert({
			where: { id_pollId: { id: userId, pollId: messageId } },
			update: { option },
			create: { id: userId, option, pollId: messageId }
		});
	}
}
