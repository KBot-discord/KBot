import { coreCacheKey } from '../keys';
import { isNullish } from '@sapphire/utilities';
import type { CoreSettings, PrismaClient } from '@kbotdev/prisma';
import type { RedisClient } from '@kbotdev/redis';
import type { GuildId, ServiceOptions, UpsertCoreSettingsData } from '../lib/types';

/**
 * Repository that handles database operations for core settings.
 */
export class CoreSettingsRepository {
	private readonly database: PrismaClient;
	private readonly cache: RedisClient;
	private readonly cacheKey = coreCacheKey;

	private readonly defaultExpiry: number;

	public constructor({ database, cache }: ServiceOptions) {
		this.database = database;

		this.cache = cache.client;
		this.defaultExpiry = cache.defaultExpiry ?? 3600000;
	}

	/**
	 * Get a guild's core settings.
	 * @param query - The {@link GuildId} to query
	 */
	public async get(query: GuildId): Promise<CoreSettings | null> {
		const { guildId } = query;

		if (isNullish(guildId)) return null;
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
	 * @param query - The {@link GuildId} to query
	 * @param data - The {@link UpsertCoreSettingsData} to upsert
	 */
	public async upsert(query: GuildId, data: UpsertCoreSettingsData): Promise<CoreSettings> {
		const { guildId } = query;

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
	 * @param query - The {@link GuildId} to query
	 */
	public async delete(query: GuildId): Promise<CoreSettings | null> {
		const { guildId } = query;

		const key = this.cacheKey(guildId);

		await this.cache.delete(key);

		return this.database.coreSettings
			.delete({
				where: { guildId }
			})
			.catch(() => null);
	}
}
