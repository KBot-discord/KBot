import { youtubeCacheKey } from '#lib/services/keys';
import { Time } from '@sapphire/duration';
import { isNullish } from '@sapphire/utilities';
import { container } from '@sapphire/framework';
import type { PrismaClient, YoutubeSettings } from '@prisma/client';
import type { UpsertYoutubeSettingsData } from '#lib/services/types/youtube';
import type { RedisClient } from '@killbasa/redis-utils';

export class YoutubeSettingsService {
	private readonly database: PrismaClient;
	private readonly cache: RedisClient;
	private readonly cacheKey = youtubeCacheKey;

	private readonly defaultExpiry: number;

	public constructor() {
		this.database = container.prisma;

		this.cache = container.redis;
		this.defaultExpiry = Time.Hour;
	}

	/**
	 * Get a guild's YouTube settings.
	 * @param guildId - The ID of the guild
	 */
	public async get(guildId: string): Promise<YoutubeSettings | null> {
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
	 * Upsert a guild's YouTube settings.
	 * @param guildId - The ID of the guild
	 * @param data - The settings to upsert
	 */
	public async upsert(guildId: string, data: UpsertYoutubeSettingsData): Promise<YoutubeSettings> {
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
