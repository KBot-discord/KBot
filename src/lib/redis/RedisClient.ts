// Imports
import Redis from 'ioredis';
import { container, Result } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import type { Key } from '../types/keys';

export class RedisClient extends Redis {
	public constructor() {
		super({
			host: container.config.redis.host,
			port: container.config.redis.port,
			password: container.config.redis.password
		});

		super.once('ready', () => container.logger.info('Redis client is ready.'));
	}

	/**
	 * Create a key-value pair. If a key already exists, it will be overwritten
	 * @param key The key generated from the KeyBuilder
	 * @param obj The object you want to add
	 * @returns If the operation succeeded
	 */
	public async add(key: Key, obj: any): Promise<boolean | null> {
		const result = await Result.fromAsync(async () => this.set(key, JSON.stringify(obj)));
		return result.match({ ok: (data) => data === 'OK', err: () => null });
	}

	/**
	 * Create a key-value pair with an expiry. If a key already exists, it will be overwritten
	 * @param key The key generated from the KeyBuilder
	 * @param obj The object you want to add
	 * @param ttl The length of time the key should live for
	 * @returns If the operation succeeded
	 */
	public async addEx(key: Key, obj: any, ttl: number): Promise<boolean | null> {
		const result = await Result.fromAsync(async () => this.setex(key, JSON.stringify(obj), ttl));
		return result.match({ ok: (data) => data === 'OK', err: () => null });
	}

	/**
	 * Get the value from the specified key
	 * @param key The key generated from the KeyBuilder
	 * @returns The data associated with the key
	 */
	public async fetch(key: Key) {
		const result = await Result.fromAsync(async () => {
			const raw = await this.get(key);
			if (isNullish(raw)) return raw;
			return JSON.parse(raw);
		});
		return result.match({ ok: (data) => data, err: () => null });
	}

	/**
	 * Delete a key-value pair
	 * @param key The key generated from the KeyBuilder
	 * @returns If the operation succeeded
	 */
	public async delete(key: Key): Promise<boolean | null> {
		const result = await Result.fromAsync(async () => this.del(key));
		return result.match({ ok: (data) => Boolean(data), err: () => null });
	}

	/**
	 * Delete all key-value pairs
	 * @param keys
	 * @returns If the operation succeeded
	 */
	public async deleteMany(keys: Key[]): Promise<boolean | null> {
		const result = await Result.fromAsync(async () => this.del(keys));
		return result.match({ ok: (data) => Boolean(data), err: () => null });
	}

	/**
	 * Create or update a hash with the provided object
	 * @param key The key generated from the KeyBuilder
	 * @param obj The object you want to add
	 * @returns If the operation succeeded
	 */
	public async addHash(key: Key, obj: any): Promise<boolean | null> {
		const result = await Result.fromAsync(async () => this.hset(key, obj));
		return result.match({ ok: (data) => Boolean(data), err: () => null });
	}

	/**
	 * Get a hash with the provided key
	 * @param key The key generated from the KeyBuilder
	 * @returns The data associated with the key
	 */
	public async fetchHash(key: Key): Promise<Record<string, string> | null> {
		const result = await Result.fromAsync(async () => this.hgetall(key));
		return result.match({ ok: (data) => data, err: () => null });
	}

	/**
	 * Get the hash values from the provided set key.
	 * This means that the set with the provided key contains the keys for the hashes.
	 * @param setKey
	 * @returns The data associated with the keys
	 */
	public async fetchManyHash(setKey: Key): Promise<Record<string, string>[] | null> {
		const result = await Result.fromAsync(async () => {
			const keys = await this.fetchSet(setKey);
			if (!keys || keys.length === 0) return [];
			const pipeline = super.pipeline();
			keys.forEach((key) => pipeline.hgetall(key));
			return (await pipeline.exec()) as Record<any, any>[];
		});
		return result.match({ ok: (data) => data, err: () => null });
	}

	/**
	 * Delete a hash with the provided key
	 * @param key The key generated from the KeyBuilder
	 * @param fields The fields to be removed
	 * @returns If the operation succeeded
	 */
	public async removeHash(key: Key, fields: string[]): Promise<boolean | null> {
		const result = await Result.fromAsync(async () => this.hdel(key, ...fields));
		return result.match({ ok: (data) => Boolean(data), err: () => null });
	}

	/**
	 * Add a member to the corresponding set
	 * @param key The key generated from the KeyBuilder
	 * @param member The member to be added
	 * @returns If the operation succeeded
	 */
	public async addSet(key: Key, member: string): Promise<boolean | null> {
		const result = await Result.fromAsync(async () => this.sadd(key, member));
		return result.match({ ok: (data) => Boolean(data), err: () => null });
	}

	/**
	 * Get a set with the provided key
	 * @param key The key generated from the KeyBuilder
	 * @returns The data associated with the key
	 */
	public async fetchSet(key: Key): Promise<string[] | null> {
		const result = await Result.fromAsync(async () => this.smembers(key));
		return result.match({ ok: (data) => data, err: () => null });
	}

	/**
	 * Remove a member from the corresponding set
	 * @param key The key generated from the KeyBuilder
	 * @param member The member to be removed
	 * @returns If the operation succeeded
	 */
	public async removeSet(key: Key, member: string): Promise<boolean | null> {
		const result = await Result.fromAsync(async () => this.srem(key, member));
		return result.match({ ok: (data) => Boolean(data), err: () => null });
	}

	/**
	 * Check if a member is in the corresponding set
	 * @param key The key generated from the KeyBuilder
	 * @param member The member to be checked
	 * @returns If the member is part of the set
	 */
	public async isMemberOfSet(key: Key, member: string): Promise<boolean | null> {
		const result = await Result.fromAsync(async () => this.sismember(key, member));
		return result.match({ ok: (data) => Boolean(data), err: () => null });
	}

	/**
	 * Scan **all** redis keys with the specified pattern, if data is found the keys will be unlinked (non-blocking delete)
	 * @param pattern The key generated from the KeyBuilder, usually including a wildcard
	 */
	public deleteScanKeys(pattern: string): void {
		this.scanStream({
			type: 'scan',
			match: pattern
		}).on('data', async (keys) => {
			if (keys.length) await this.unlink(keys);
		});
	}
}
