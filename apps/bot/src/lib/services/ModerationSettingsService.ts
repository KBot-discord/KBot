import { moderationCacheKey } from '#lib/services/keys';
import { Time } from '@sapphire/duration';
import { isNullish } from '@sapphire/utilities';
import { container } from '@sapphire/framework';
import type { ModerationSettings, PrismaClient } from '@prisma/client';
import type { UpsertModerationSettingsData } from '#lib/services/types/moderation';
import type { RedisClient } from '@killbasa/redis-utils';

export class ModerationSettingsService {
	private readonly database: PrismaClient;
	private readonly cache: RedisClient;
	private readonly cacheKey = moderationCacheKey;

	private readonly defaultExpiry: number;

	public constructor() {
		this.database = container.prisma;

		this.cache = container.redis;
		this.defaultExpiry = Time.Hour;
	}

	/**
	 * Get a guild's moderation settings.
	 * @param guildId - The ID of the guild
	 */
	public async get(guildId: string): Promise<ModerationSettings | null> {
		const key = this.cacheKey(guildId);

		const cacheResult = await this.cache.get<ModerationSettings>(key);
		if (!isNullish(cacheResult)) {
			await this.cache.updateExpiry(key, this.defaultExpiry);
			return cacheResult;
		}

		const dbResult = await this.database.moderationSettings.findUnique({
			where: { guildId }
		});
		if (isNullish(dbResult)) {
			return null;
		}

		await this.cache.setEx(key, dbResult, this.defaultExpiry);
		return dbResult;
	}

	/**
	 * Upsert a guild's moderation settings.
	 * @param guildId - The ID of the guild
	 * @param data - The settings to upsert
	 */
	public async upsert(guildId: string, data: UpsertModerationSettingsData): Promise<ModerationSettings> {
		const key = this.cacheKey(guildId);

		const settings = await this.database.moderationSettings.upsert({
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
