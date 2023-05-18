import { Redis, type RedisKey } from 'ioredis';
import type { Key, RedisClientOptions } from '../types/RedisTypes';

export class RedisClient extends Redis {
	public constructor(options: RedisClientOptions) {
		super(options);
	}

	public override async get<T = unknown>(key: Key): Promise<T | null> {
		const result = await super.get(key);
		if (result === null) return result;
		return JSON.parse(result) as T;
	}

	public override async set<T = unknown>(key: Key, data: T): Promise<'OK'> {
		return super.set(key, JSON.stringify(data));
	}

	public async setEx<T = unknown>(key: Key, data: T, seconds: number): Promise<'OK'> {
		return super.setex(key, seconds, JSON.stringify(data));
	}

	public async delete(key: Key): Promise<number> {
		return super.del(key);
	}

	public async deleteMany(keys: Key[]): Promise<number> {
		return super.del(keys);
	}

	public async updateExpiry(key: Key, seconds: number): Promise<number> {
		return super.expire(key, seconds);
	}

	public async hSet<T = unknown>(hashKey: Key, key: Key, data: T): Promise<number> {
		return super.hset(hashKey, { [key]: JSON.stringify(data) });
	}

	public async hmSet<T = unknown>(hashKey: Key, data: Map<Key, T>): Promise<number> {
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
			data.set(key, JSON.parse(val) as T);
		}

		return data;
	}

	public async hGetValues<T = unknown>(key: Key): Promise<T[]> {
		const result = await super.hgetall(key);

		return Object.values(result).map((val) => JSON.parse(val) as T);
	}

	public async sAdd(key: Key, member: Key): Promise<boolean> {
		return (await super.sadd(key, member)) === 1;
	}

	public async sRem(key: Key, member: Key): Promise<boolean> {
		return (await super.srem(key, member)) === 1;
	}

	public async sIsMember(key: Key, member: Key): Promise<boolean> {
		return (await super.sismember(key, member)) === 1;
	}

	public async sMembers(key: Key): Promise<string[]> {
		return super.smembers(key);
	}

	public deleteScanKeys(pattern: string): void {
		super
			.scanStream({
				type: 'scan',
				match: pattern
			})
			.on('data', async (keys: RedisKey[]) => {
				if (keys.length > 0) {
					await this.unlink(keys).catch(() => null);
				}
			});
	}
}
