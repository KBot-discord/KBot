import { moderationCacheKey } from './keys.js';
import { Time } from '@sapphire/duration';
import { isNullish } from '@sapphire/utilities';
import { container } from '@sapphire/framework';
import type { ModerationSettings } from '@prisma/client';

export class ModerationSettingsService {
	private readonly cacheKey = moderationCacheKey;

	private readonly defaultExpiry: number;

	public constructor() {
		this.defaultExpiry = Time.Hour;
	}

	/**
	 * Get a guild's moderation settings.
	 * @param guildId - The ID of the guild
	 */
	public async get(guildId: string): Promise<ModerationSettings | null> {
		const key = this.cacheKey(guildId);

		const cacheResult = await container.redis.get<ModerationSettings>(key);
		if (!isNullish(cacheResult)) {
			await container.redis.updateExpiry(key, this.defaultExpiry);
			return cacheResult;
		}

		const dbResult = await container.prisma.moderationSettings.findUnique({
			where: { guildId }
		});
		if (isNullish(dbResult)) {
			return null;
		}

		await container.redis.setEx(key, dbResult, this.defaultExpiry);
		return dbResult;
	}

	/**
	 * Upsert a guild's moderation settings.
	 * @param guildId - The ID of the guild
	 * @param data - The settings to upsert
	 */
	public async upsert(
		guildId: string,
		data: {
			enabled?: boolean;
			reportChannelId?: string | null;
			minAccountAgeEnabled?: boolean;
			minAccountAgeReq?: number | null;
			minAccountAgeMsg?: string | null;
			antiHoistEnabled?: boolean;
		}
	): Promise<ModerationSettings> {
		const key = this.cacheKey(guildId);

		const settings = await container.prisma.moderationSettings.upsert({
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
		await container.redis.setEx(key, settings, this.defaultExpiry);

		return settings;
	}
}
