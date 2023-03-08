import { twitchCacheKey } from '#utils/cache';
import { container } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import type { PrismaClient, TwitchSettings } from '#prisma';
import type { GuildId, UpsertModerationSettingsData } from '#types/database';
import type { RedisClient } from '#extensions/RedisClient';

export class TwitchSettingsService {
	private readonly database: PrismaClient;
	private readonly cache: RedisClient;

	private readonly cacheKey = twitchCacheKey;

	private CacheTime = container.config.db.cacheExpiry;

	public constructor() {
		this.database = container.prisma;
		this.cache = container.redis;
	}

	public async get({ guildId }: GuildId): Promise<TwitchSettings | null> {
		const key = this.cacheKey(guildId);

		const cacheResult = await this.cache.get<TwitchSettings>(key);
		if (!isNullish(cacheResult)) {
			await this.cache.updateExpiry(key, this.CacheTime);
			return cacheResult;
		}

		const dbResult = await this.database.twitchSettings.findUnique({
			where: { guildId }
		});
		if (isNullish(dbResult)) {
			return null;
		}

		await this.cache.setEx(key, dbResult, this.CacheTime);
		return dbResult;
	}

	public async upsert({ guildId }: GuildId, data: UpsertModerationSettingsData): Promise<TwitchSettings> {
		const key = this.cacheKey(guildId);

		const settings = await this.database.twitchSettings.upsert({
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
