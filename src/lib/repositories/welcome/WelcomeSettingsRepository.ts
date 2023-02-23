import { welcomeCacheKey } from '#utils/cache';
import { container } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import type { PrismaClient, WelcomeSettings } from '#prisma';
import type { RedisClient } from '#lib/extensions/RedisClient';
import type { UpsertWelcomeSettingsData, QueryByGuildId } from '#types/repositories';

export class WelcomeSettingsRepository {
	private readonly database: PrismaClient;
	private readonly cache: RedisClient;

	private readonly settingsKey = welcomeCacheKey;

	private CacheTime = container.config.db.cacheExpiry;

	public constructor() {
		this.database = container.prisma;
		this.cache = container.redis;
	}

	public async findOne({ guildId }: QueryByGuildId): Promise<WelcomeSettings | null> {
		const key = this.settingsKey(guildId);

		const cacheResult = await this.cache.get<WelcomeSettings>(key);
		if (!isNullish(cacheResult)) {
			await this.cache.update(key, this.CacheTime);
			return cacheResult;
		}

		const dbResult = await this.database.welcomeSettings.findUnique({
			where: { guildId }
		});
		if (isNullish(dbResult)) {
			return null;
		}

		await this.cache.setEx(key, dbResult, this.CacheTime);
		return dbResult;
	}

	public async upsert({ guildId }: QueryByGuildId, data: UpsertWelcomeSettingsData): Promise<WelcomeSettings> {
		const key = this.settingsKey(guildId);

		const settings = await this.database.welcomeSettings.upsert({
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
