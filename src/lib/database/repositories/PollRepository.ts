import { container, Result } from '@sapphire/framework';
import type { Message } from 'discord.js';
import type { Poll, PollUser } from '@prisma/client';

export class PollRepository {
	/**
	 * Create a new poll in the database
	 * @param message The message associated with the poll
	 * @param title The title of the poll
	 * @param options The options of the poll
	 * @param expiresAt When the poll expires
	 * @returns Returns the new poll
	 */
	public async createPoll(message: Message, title: string, options: string[], expiresAt: number): Promise<Poll | null> {
		const result = await Result.fromAsync(async () =>
			container.db.poll.create({
				data: {
					id: message.id,
					title,
					channel: message.channelId,
					time: expiresAt,
					options,
					utility: { connect: { id: message.guildId! } }
				}
			})
		);
		return result.match({
			ok: (data) => data,
			err: (err) => {
				container.logger.error(err);
				return null;
			}
		});
	}

	/**
	 * Get a poll from the database
	 * @param messageId The message ID of the poll
	 * @returns The requested poll
	 */
	public async getPoll(messageId: string): Promise<Poll | null> {
		const result = await Result.fromAsync(async () => container.db.poll.findUnique({ where: { id: messageId } }));
		return result.match({
			ok: (data) => data,
			err: (err) => {
				container.logger.error(err);
				return null;
			}
		});
	}

	/**
	 * Get a poll and its users from the database
	 * @param messageId The message ID of the poll
	 * @returns The requested poll with its users
	 */
	public async getPollWithUsers(messageId: string): Promise<(Poll & { users: PollUser[] }) | null> {
		const result = await Result.fromAsync(async () =>
			container.db.poll.findUnique({
				where: { id: messageId },
				include: { users: true }
			})
		);
		return result.match({
			ok: (data) => data,
			err: (err) => {
				container.logger.error(err);
				return null;
			}
		});
	}

	/**
	 * Get all the polls of a guild with its users from the database
	 * @param guildId The ID of the guild
	 * @returns The requested polls with its users
	 */
	public async getPollsWithUsers(guildId: string): Promise<(Poll & { users: PollUser[] })[] | null> {
		const result = await Result.fromAsync(async () =>
			container.db.poll.findMany({
				where: { guildId },
				include: { users: true }
			})
		);
		return result.match({
			ok: (data) => data,
			err: (err) => {
				container.logger.error(err);
				return null;
			}
		});
	}

	/**
	 * Delete a poll from the database
	 * @param messageId The message ID of the poll
	 * @returns The deleted poll
	 */
	public async deletePoll(messageId: string): Promise<Poll | null> {
		const result = await Result.fromAsync(async () => container.db.poll.delete({ where: { id: messageId } }));
		return result.match({
			ok: (data) => data,
			err: (err) => {
				container.logger.error(err);
				return null;
			}
		});
	}

	/**
	 * Update a user on the requested poll
	 * @param userId The ID of the user
	 * @param messageId The message ID of the poll
	 * @param option The option that the user chose
	 * @returns The updated user
	 */
	public async updatePollUser(userId: string, messageId: string, option: number): Promise<PollUser | null> {
		const result = await Result.fromAsync(async () =>
			container.db.pollUser.upsert({
				where: { id_pollId: { id: userId, pollId: messageId } },
				update: { option },
				create: { id: userId, option, pollId: messageId }
			})
		);
		return result.match({
			ok: (data) => data,
			err: (err) => {
				container.logger.error(err);
				return null;
			}
		});
	}
}
