import { welcomeCacheKey } from '../keys';
import { isNullish } from '@sapphire/utilities';
import type { RedisClient } from '@kbotdev/redis';
import type { PrismaClient, WelcomeSettings } from '@kbotdev/prisma';
import type { GuildId, ServiceOptions, UpsertWelcomeSettingsData } from '../lib/types';

export class WelcomeSettingsRepository {
	private readonly database: PrismaClient;
	private readonly cache: RedisClient;
	private readonly cacheKey = welcomeCacheKey;

	private readonly defaultExpiry: number;

	public constructor({ database, cache }: ServiceOptions) {
		this.database = database;

		this.cache = cache.client;
		this.defaultExpiry = cache.defaultExpiry ?? 3600000;
	}

	public async get({ guildId }: GuildId): Promise<WelcomeSettings | null> {
		const key = this.cacheKey(guildId);

		const cacheResult = await this.cache.get<WelcomeSettings>(key);
		if (!isNullish(cacheResult)) {
			await this.cache.updateExpiry(key, this.defaultExpiry);
			return cacheResult;
		}

		const dbResult = await this.database.welcomeSettings.findUnique({
			where: { guildId }
		});
		if (isNullish(dbResult)) {
			return null;
		}

		await this.cache.setEx(key, dbResult, this.defaultExpiry);
		return dbResult;
	}

	public async upsert({ guildId }: GuildId, data: UpsertWelcomeSettingsData): Promise<WelcomeSettings> {
		const key = this.cacheKey(guildId);

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
		await this.cache.setEx(key, settings, this.defaultExpiry);

		return settings;
	}
}
