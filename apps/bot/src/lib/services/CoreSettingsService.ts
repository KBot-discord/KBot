import { coreCacheKey } from '#lib/services/keys';
import { Time } from '@sapphire/duration';
import { isNullish } from '@sapphire/utilities';
import { container } from '@sapphire/framework';
import type { CoreSettings, FeatureFlags, PrismaClient } from '@prisma/client';
import type { RedisClient } from '@killbasa/redis-utils';

export class CoreSettingsService {
	private readonly database: PrismaClient;
	private readonly cache: RedisClient;
	private readonly cacheKey = coreCacheKey;

	private readonly defaultExpiry: number;

	public constructor() {
		this.database = container.prisma;

		this.cache = container.redis;
		this.defaultExpiry = Time.Hour;
	}

	/**
	 * Get a guild's core settings.
	 * @param guildId - The ID of the guild
	 */
	public async get(guildId: string): Promise<CoreSettings | null> {
		const key = this.cacheKey(guildId);

		const cacheResult = await this.cache.get<CoreSettings>(key);
		if (!isNullish(cacheResult)) {
			await this.cache.updateExpiry(key, this.defaultExpiry);
			return cacheResult;
		}

		const dbResult = await this.database.coreSettings.findUnique({
			where: { guildId }
		});
		if (isNullish(dbResult)) {
			return null;
		}

		await this.cache.setEx(key, dbResult, this.defaultExpiry);
		return dbResult;
	}

	/**
	 * Upsert a guild's core settings.
	 * @param guildId - The ID of the guild
	 * @param data - The settings to upsert
	 */
	public async upsert(
		guildId: string, //
		data: { flags?: FeatureFlags[] } = {}
	): Promise<CoreSettings> {
		const key = this.cacheKey(guildId);

		const settings = await this.database.coreSettings.upsert({
			where: { guildId },
			update: data,
			create: { ...data, guildId }
		});
		await this.cache.setEx(key, settings, this.defaultExpiry);

		return settings;
	}

	/**
	 * Delete a guild's core settings.
	 * @param guildId - The ID of the guild
	 */
	public async delete(guildId: string): Promise<CoreSettings | null> {
		const key = this.cacheKey(guildId);

		await this.cache.delete(key);

		return await this.database.coreSettings
			.delete({
				where: { guildId }
			})
			.catch(() => null);
	}
}
