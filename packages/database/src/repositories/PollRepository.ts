import { pollCacheKey } from '../keys';
import type { Key, RedisClient } from '@kbotdev/redis';
import type { ServiceOptions, PollId, GuildId, GuildAndPollId, CreatePollData, UpsertPollUserData } from '../lib/types';
import type { Poll, PrismaClient } from '@kbotdev/prisma';

export class PollRepository {
	private readonly database: PrismaClient;
	private readonly cache: RedisClient;

	public constructor({ database, cache }: ServiceOptions) {
		this.database = database;

		this.cache = cache.client;
	}

	public async get({ pollId }: PollId): Promise<Poll | null> {
		return this.database.poll.findUnique({
			where: { id: pollId }
		});
	}

	public async getByGuild({ guildId }: GuildId): Promise<Poll[]> {
		return this.database.poll.findMany({
			where: { guildId }
		});
	}

	public async create({ guildId, pollId }: GuildAndPollId, { title, channelId, time, options, creator }: CreatePollData): Promise<Poll> {
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

	public async delete({ guildId, pollId }: GuildAndPollId): Promise<Poll | null> {
		const pollKey = this.pollKey(guildId, pollId);
		await this.cache.del(pollKey);
		return this.database.poll
			.delete({
				where: { id: pollId }
			})
			.catch(() => null);
	}

	public async count({ guildId }: GuildId): Promise<number> {
		return this.database.poll.count({
			where: { guildId }
		});
	}

	public async isActive({ guildId, pollId }: GuildAndPollId): Promise<boolean> {
		return this.cache.sIsMember(this.setKey(guildId), this.memberKey(pollId));
	}

	public async upsertVote({ guildId, pollId, userId, option }: UpsertPollUserData): Promise<void> {
		const pollKey = this.pollKey(guildId, pollId);
		const userKey = this.pollUserKey(userId);
		await this.cache.hSet<number>(pollKey, userKey, option);
	}

	public async getVotes({ guildId, pollId }: GuildAndPollId): Promise<Map<string, number>> {
		const pollKey = this.pollKey(guildId, pollId);
		return this.cache.hGetAll<number>(pollKey);
	}

	public async addActive({ guildId, pollId }: GuildAndPollId): Promise<boolean> {
		return this.cache.sAdd(this.setKey(guildId), this.memberKey(pollId));
	}

	public async removeActive({ guildId, pollId }: GuildAndPollId): Promise<boolean> {
		return this.cache.sRem(this.setKey(guildId), this.memberKey(pollId));
	}

	private readonly pollKey = (guildId: string, pollId: string): Key => `${pollCacheKey(guildId)}:${pollId}` as Key;
	private readonly pollUserKey = (userId: string): Key => `user:${userId}` as Key;
	private readonly setKey = (guildId: string): Key => `${pollCacheKey(guildId)}:active` as Key;
	private readonly memberKey = (pollId: string): Key => `polls:${pollId}:active` as Key;
}
