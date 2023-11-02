import { eventCacheKey } from './keys';
import { isNullish } from '@sapphire/utilities';
import { Time } from '@sapphire/duration';
import type { EventSettings, PrismaClient } from '@prisma/client';
import type { RedisClient } from '@killbasa/redis-utils';
import type { ServiceOptions } from './types/serviceTypes';
import type { GuildId, UpsertEventSettingsData } from './types';

/**
 * Repository that handles database operations for event settings.
 */
export class EventSettingsRepository {
	private readonly database: PrismaClient;
	private readonly cache: RedisClient;
	private readonly cacheKey = eventCacheKey;

	private readonly defaultExpiry: number;

	public constructor({ database, cache }: ServiceOptions) {
		this.database = database;

		this.cache = cache.client;
		this.defaultExpiry = cache.defaultExpiry ?? Time.Hour;
	}

	/**
	 * Get a guild's event settings.
	 * @param query - The {@link GuildId} to query
	 */
	public async get({ guildId }: GuildId): Promise<EventSettings | null> {
		const key = this.cacheKey(guildId);

		const cacheResult = await this.cache.get<EventSettings>(key);
		if (!isNullish(cacheResult)) {
			await this.cache.updateExpiry(key, this.defaultExpiry);
			return cacheResult;
		}

		const dbResult = await this.database.eventSettings.findUnique({
			where: { guildId }
		});
		if (isNullish(dbResult)) {
			return null;
		}

		await this.cache.setEx(key, dbResult, this.defaultExpiry);
		return dbResult;
	}

	/**
	 * Upsert a guild's event settings.
	 * @param query - The {@link GuildId} to query
	 * @param data - The {@link UpsertEventSettingsData} to upsert
	 */
	public async upsert({ guildId }: GuildId, data: UpsertEventSettingsData): Promise<EventSettings> {
		const key = this.cacheKey(guildId);

		const settings = await this.database.eventSettings.upsert({
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
