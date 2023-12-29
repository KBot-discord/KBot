import { eventCacheKey } from '#lib/services/keys';
import { isNullish } from '@sapphire/utilities';
import { Time } from '@sapphire/duration';
import { container } from '@sapphire/framework';
import type { EventSettings, PrismaClient } from '@prisma/client';
import type { RedisClient } from '@killbasa/redis-utils';

export class EventSettingsService {
	private readonly database: PrismaClient;
	private readonly cache: RedisClient;
	private readonly cacheKey = eventCacheKey;

	private readonly defaultExpiry: number;

	public constructor() {
		this.database = container.prisma;

		this.cache = container.redis;
		this.defaultExpiry = Time.Hour;
	}

	/**
	 * Get a guild's event settings.
	 * @param guildId - The ID of the guild
	 */
	public async get(guildId: string): Promise<EventSettings | null> {
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
	 * @param guildId - The ID of the guild
	 * @param data - The settings to upsert
	 */
	public async upsert(
		guildId: string,
		data: {
			enabled?: boolean;
		}
	): Promise<EventSettings> {
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
