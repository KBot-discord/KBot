import { minutesFromNow } from '#utils/util';
import Redis from 'ioredis';
import { container } from '@sapphire/framework';
import type { Key } from '../types/Cache';

export class RedisClient extends Redis {
	public constructor() {
		const { host, port, password } = container.config.redis;
		super({ host, port, password });

		super.once('ready', () => container.logger.info('Redis client is ready.'));
	}

	public override async set<T = unknown>(key: Key, data: T) {
		return super.set(key, JSON.stringify(data));
	}

	public async setEx<T = unknown>(key: Key, data: T, minutes: number) {
		return super.setex(key, minutesFromNow(minutes), JSON.stringify(data));
	}

	public override async get<T = unknown>(key: Key) {
		const result = await super.get(key);
		if (result === null) return result;
		return JSON.parse(result) as T;
	}

	public async delete(key: Key) {
		return super.del(key);
	}

	public async deleteMany(keys: Key[]) {
		return super.del(keys);
	}

	public async update(key: Key, minutes: number) {
		return super.expire(key, minutesFromNow(minutes));
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
