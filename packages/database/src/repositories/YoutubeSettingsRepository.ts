import { youtubeCacheKey } from '../keys';
import { isNullish } from '@sapphire/utilities';
import type { RedisClient } from '@kbotdev/redis';
import type { PrismaClient, YoutubeSettings } from '@kbotdev/prisma';
import type { GuildId, ServiceOptions, UpsertUtilitySettingsData } from '../lib/types';

/**
 * Repository that handles database operations for YouTube settings.
 */
export class YoutubeSettingsRepository {
	private readonly database: PrismaClient;
	private readonly cache: RedisClient;
	private readonly cacheKey = youtubeCacheKey;

	private readonly defaultExpiry: number;

	public constructor({ database, cache }: ServiceOptions) {
		this.database = database;

		this.cache = cache.client;
		this.defaultExpiry = cache.defaultExpiry ?? 3600000;
	}

	/**
	 * Get a guild's youtube settings.
	 * @param query - The {@link GuildId} to query
	 */
	public async get({ guildId }: GuildId): Promise<YoutubeSettings | null> {
		const key = this.cacheKey(guildId);

		const cacheResult = await this.cache.get<YoutubeSettings>(key);
		if (!isNullish(cacheResult)) {
			await this.cache.updateExpiry(key, this.defaultExpiry);
			return cacheResult;
		}

		const dbResult = await this.database.youtubeSettings.findUnique({
			where: { guildId }
		});
		if (isNullish(dbResult)) {
			return null;
		}

		await this.cache.setEx(key, dbResult, this.defaultExpiry);
		return dbResult;
	}

	/**
	 * Upsert a guild's youtube settings.
	 * @param query - The {@link GuildId} to query
	 * @param data - The {@link UpsertWelcomeSettingsData} to upsert
	 */
	public async upsert({ guildId }: GuildId, data: UpsertUtilitySettingsData): Promise<YoutubeSettings> {
		const key = this.cacheKey(guildId);

		const settings = await this.database.youtubeSettings.upsert({
			where: { guildId },
			update: data,
			create: {
				...data,
				coreSettings: {
					connectOrCreate: {
						where: { guildId },
						create: { guildId }
					}
				}
			}
		});
		await this.cache.setEx(key, settings, this.defaultExpiry);

		return settings;
	}
}
