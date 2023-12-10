import { utilityCacheKey } from './keys';
import { Time } from '@sapphire/duration';
import { isNullish } from '@sapphire/utilities';
import { container } from '@sapphire/framework';
import type { PrismaClient, UtilitySettings } from '@prisma/client';
import type { UpsertUtilitySettingsData } from '#lib/services/types/utility';
import type { RedisClient } from '@killbasa/redis-utils';

export class UtilitySettingsService {
	private readonly database: PrismaClient;
	private readonly cache: RedisClient;
	private readonly cacheKey = utilityCacheKey;

	private readonly defaultExpiry: number;

	public constructor() {
		this.database = container.prisma;

		this.cache = container.redis;
		this.defaultExpiry = Time.Hour;
	}

	/**
	 * Get a guild's utility settings.
	 * @param guildId - The ID of the guild
	 */
	public async get(guildId: string): Promise<UtilitySettings | null> {
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
	 * @param guildId - The ID of the guild
	 * @param data - The settings to upsert
	 */
	public async upsert(guildId: string, data: UpsertUtilitySettingsData): Promise<UtilitySettings> {
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
	 * Get all of the valid Discord incident channels for notifications.
	 */
	public async getIncidentChannels(): Promise<{ guildId: string; channelId: string }[]> {
		return await this.database.utilitySettings
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
