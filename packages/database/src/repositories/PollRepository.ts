import { pollCacheKey } from '../keys';
import type { Key, RedisClient } from '@kbotdev/redis';
import type { CreatePollData, GuildAndPollId, GuildId, PollId, ServiceOptions, UpsertPollUserData } from '../lib/types';
import type { Poll, PrismaClient } from '@kbotdev/prisma';

/**
 * Repository that handles database operations for polls.
 */
export class PollRepository {
	private readonly database: PrismaClient;
	private readonly cache: RedisClient;

	public constructor({ database, cache }: ServiceOptions) {
		this.database = database;

		this.cache = cache.client;
	}

	/**
	 * Get a poll.
	 * @param query - The {@link PollId} to query
	 */
	public async get(query: PollId): Promise<Poll | null> {
		const { pollId } = query;

		return this.database.poll.findUnique({
			where: { id: pollId }
		});
	}

	/**
	 * Get the polls of a guild.
	 * @param query - The {@link GuildId} to query
	 */
	public async getByGuild(query: GuildId): Promise<Poll[]> {
		const { guildId } = query;

		return this.database.poll.findMany({
			where: { guildId }
		});
	}

	/**
	 * Create a poll.
	 * @param query - The {@link GuildAndPollId} to query
	 * @param data - The {@link CreatePollData} to create the poll
	 */
	public async create(query: GuildAndPollId, data: CreatePollData): Promise<Poll> {
		const { guildId, pollId } = query;
		const { title, channelId, time, options, creator } = data;

		await this.addActive({ guildId, pollId });
		return this.database.poll.create({
			data: {
				id: pollId,
				title,
				channelId,
				time,
				options,
				creator,
				utilitySettings: { connect: { guildId } }
			}
		});
	}

	/**
	 * Delete a poll.
	 * @param query - The {@link GuildAndPollId} to query
	 */
	public async delete(query: GuildAndPollId): Promise<Poll | null> {
		const { guildId, pollId } = query;

		const pollKey = this.pollKey(guildId, pollId);

		await this.cache.del(pollKey);
		return this.database.poll
			.delete({
				where: { id: pollId }
			})
			.catch(() => null);
	}

	/**
	 * Get the count of polls for a guild.
	 * @param query - The {@link GuildId} to query
	 */
	public async count(query: GuildId): Promise<number> {
		const { guildId } = query;

		return this.database.poll.count({
			where: { guildId }
		});
	}

	/**
	 * Check if a poll is active.
	 * @param query - The {@link GuildAndPollId} to query
	 */
	public async isActive(query: GuildAndPollId): Promise<boolean> {
		const { guildId, pollId } = query;

		return this.cache.sIsMember(this.setKey(guildId), this.memberKey(pollId));
	}

	/**
	 * Add a vote to a poll.
	 * @param data - The {@link UpsertPollUserData} to upsert a vote
	 */
	public async upsertVote(data: UpsertPollUserData): Promise<void> {
		const { guildId, pollId, userId, option } = data;

		const pollKey = this.pollKey(guildId, pollId);
		const userKey = this.pollUserKey(userId);

		await this.cache.hSet<number>(pollKey, userKey, option);
	}

	/**
	 * Get a poll's votes.
	 * @param query - The {@link GuildAndPollId} to query
	 */
	public async getVotes(query: GuildAndPollId): Promise<Map<string, number>> {
		const { guildId, pollId } = query;

		const pollKey = this.pollKey(guildId, pollId);

		return this.cache.hGetAll<number>(pollKey);
	}

	/**
	 * Set a poll as active.
	 * @param data - The {@link GuildAndPollId} to set the poll as active
	 */
	public async addActive(data: GuildAndPollId): Promise<boolean> {
		const { guildId, pollId } = data;

		return this.cache.sAdd(this.setKey(guildId), this.memberKey(pollId));
	}

	/**
	 * Set a poll as inactive.
	 * @param data - The {@link GuildAndPollId} to set the poll as inactive
	 */
	public async removeActive(data: GuildAndPollId): Promise<boolean> {
		const { guildId, pollId } = data;

		return this.cache.sRem(this.setKey(guildId), this.memberKey(pollId));
	}

	private readonly pollKey = (guildId: string, pollId: string): Key => `${pollCacheKey(guildId)}:${pollId}` as Key;
	private readonly pollUserKey = (userId: string): Key => `user:${userId}` as Key;
	private readonly setKey = (guildId: string): Key => `${pollCacheKey(guildId)}:active` as Key;
	private readonly memberKey = (pollId: string): Key => `polls:${pollId}:active` as Key;
}
