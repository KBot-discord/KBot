import { youtubeCacheKey } from '#utils/cache';
import { isNullish } from '@sapphire/utilities';
import { container } from '@sapphire/framework';
import type { RedisClient } from '#extensions/RedisClient';
import type { PrismaClient, YoutubeSettings } from '#prisma';
import type { GuildId, UpsertUtilitySettingsData } from '#types/database';

export class YoutubeSettingsService {
	private readonly database: PrismaClient;
	private readonly cache: RedisClient;

	private readonly cacheKey = youtubeCacheKey;

	private CacheTime = container.config.db.cacheExpiry;

	public constructor() {
		this.database = container.prisma;
		this.cache = container.redis;
	}

	public async get({ guildId }: GuildId): Promise<YoutubeSettings | null> {
		const key = this.cacheKey(guildId);

		const cacheResult = await this.cache.get<YoutubeSettings>(key);
		if (!isNullish(cacheResult)) {
			await this.cache.updateExpiry(key, this.CacheTime);
			return cacheResult;
		}

		const dbResult = await this.database.youtubeSettings.findUnique({
			where: { guildId }
		});
		if (isNullish(dbResult)) {
			return null;
		}

		await this.cache.setEx(key, dbResult, this.CacheTime);
		return dbResult;
	}

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
		await this.cache.setEx(key, settings, this.CacheTime);

		return settings;
	}
}
