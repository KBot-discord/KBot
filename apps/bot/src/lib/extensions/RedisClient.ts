import { minutesFromNow } from '#utils/functions';
import { Redis } from 'ioredis';
import { container } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import type { Key } from '#types/Generic';

export class RedisClient extends Redis {
	public constructor() {
		const { host, port, password } = container.config.redis;
		super({ host, port, password });

		super.once('ready', () => container.logger.info('Redis client is ready.'));
	}

	public override async get<T = unknown>(key: Key): Promise<T | null> {
		const result = await super.get(key);
		if (isNullish(result)) return result;
		return JSON.parse(result) as T;
	}

	public override async set<T = unknown>(key: Key, data: T) {
		return super.set(key, JSON.stringify(data));
	}

	public async setEx<T = unknown>(key: Key, data: T, minutes: number) {
		return super.setex(key, minutesFromNow(minutes), JSON.stringify(data));
	}

	public async delete(key: Key) {
		return super.del(key);
	}

	public async deleteMany(keys: Key[]) {
		return super.del(keys);
	}

	public async updateExpiry(key: Key, minutes: number) {
		return super.expire(key, minutesFromNow(minutes));
	}

	public async hSet<T = unknown>(hashKey: Key, key: Key, data: T) {
		return super.hset(hashKey, { [key]: JSON.stringify(data) });
	}

	public async hmSet<T = unknown>(hashKey: Key, data: Map<Key, T>) {
		const formattedData = new Map<Key, string>();
		for (const [key, value] of data.entries()) {
			formattedData.set(key, JSON.stringify(value));
		}
		return super.hset(hashKey, formattedData);
	}

	public async hGetAll<T = unknown>(key: Key): Promise<Map<string, T>> {
		const result = await super.hgetall(key);

		const data: Map<string, T> = new Map();
		for (const [key, val] of Object.entries(result)) {
			data.set(key, JSON.parse(val));
		}

		return data;
	}

	public async hGetValues<T = unknown>(key: Key): Promise<T[]> {
		const result = await super.hgetall(key);

		return Object.values(result).map((val) => JSON.parse(val));
	}

	public async sAdd(key: Key, member: Key) {
		return (await super.sadd(key, member)) === 1;
	}

	public async sRem(key: Key, member: Key) {
		return (await super.srem(key, member)) === 1;
	}

	public async sIsMember(key: Key, member: Key): Promise<boolean> {
		return (await super.sismember(key, member)) === 1;
	}

	public async sMembers(key: Key) {
		return super.smembers(key);
	}

	public deleteScanKeys(pattern: string): void {
		super
			.scanStream({
				type: 'scan',
				match: pattern
			})
			.on('data', async (keys) => {
				if (keys.length) await this.unlink(keys);
			});
	}
}
