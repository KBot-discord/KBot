import { utilityCacheKey } from '../keys';
import { isNullish } from '@sapphire/utilities';
import { Time } from '@sapphire/duration';
import type { PrismaClient, UtilitySettings } from '@kbotdev/prisma';
import type { RedisClient } from '@kbotdev/redis';
import type { GuildId, ServiceOptions, UpsertUtilitySettingsData } from '../lib/types';

/**
 * Repository that handles database operations for utility settings.
 */
export class UtilitySettingsRepository {
	private readonly database: PrismaClient;
	private readonly cache: RedisClient;
	private readonly cacheKey = utilityCacheKey;

	private readonly defaultExpiry: number;

	public constructor({ database, cache }: ServiceOptions) {
		this.database = database;

		this.cache = cache.client;
		this.defaultExpiry = cache.defaultExpiry ?? Time.Hour;
	}

	/**
	 * Get a guild's utility settings.
	 * @param query - The {@link GuildId} to query
	 */
	public async get({ guildId }: GuildId): Promise<UtilitySettings | null> {
		const key = this.cacheKey(guildId);

		const cacheResult = await this.cache.get<UtilitySettings>(key);
		if (!isNullish(cacheResult)) {
			await this.cache.updateExpiry(key, this.defaultExpiry);
			return cacheResult;
		}

		const dbResult = await this.database.utilitySettings.findUnique({
			where: { guildId }
		});
		if (isNullish(dbResult)) {
			return null;
		}

		await this.cache.setEx(key, dbResult, this.defaultExpiry);
		return dbResult;
	}

	/**
	 * Upsert a guild's utility settings.
	 * @param query - The {@link GuildId} to query
	 * @param data - The {@link UpsertUtilitySettingsData} to upsert
	 */
	public async upsert({ guildId }: GuildId, data: UpsertUtilitySettingsData): Promise<UtilitySettings> {
		const key = this.cacheKey(guildId);

		const settings = await this.database.utilitySettings.upsert({
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

	/**
	 * Get all of the valid Discord incident channels.
	 */
	public async getIncidentChannels(): Promise<{ guildId: string; channelId: string }[]> {
		return this.database.utilitySettings
			.findMany({
				where: { AND: { enabled: true, NOT: { incidentChannelId: null } } },
				select: { guildId: true, incidentChannelId: true }
			})
			.then((res) =>
				res //
					.filter((settings) => !isNullish(settings.incidentChannelId))
					.map(({ guildId, incidentChannelId }) => ({ guildId, channelId: incidentChannelId! }))
			);
	}
}
