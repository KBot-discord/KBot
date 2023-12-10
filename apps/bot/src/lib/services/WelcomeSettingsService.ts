import { welcomeCacheKey } from './keys';
import { Time } from '@sapphire/duration';
import { isNullish } from '@sapphire/utilities';
import { container } from '@sapphire/framework';
import type { PrismaClient, WelcomeSettings } from '@prisma/client';
import type { UpsertWelcomeSettingsData } from '#lib/services/types/welcome';
import type { RedisClient } from '@killbasa/redis-utils';

export class WelcomeSettingsService {
	private readonly database: PrismaClient;
	private readonly cache: RedisClient;
	private readonly cacheKey = welcomeCacheKey;

	private readonly defaultExpiry: number;

	public constructor() {
		this.database = container.prisma;

		this.cache = container.redis;
		this.defaultExpiry = Time.Hour;
	}

	/**
	 * Get a guild's welcome settings.
	 * @param guildId - The ID of the guild
	 */
	public async get(guildId: string): Promise<WelcomeSettings | null> {
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

	/**
	 * Upsert a guild's welcome settings.
	 * @param guildId - The ID of the guild
	 * @param data - The settings to upsert
	 */
	public async upsert(guildId: string, data: UpsertWelcomeSettingsData): Promise<WelcomeSettings> {
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
