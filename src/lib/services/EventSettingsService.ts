import type { EventSettings } from '@prisma/client';
import { Time } from '@sapphire/duration';
import { container } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import { eventCacheKey } from './keys.js';

export class EventSettingsService {
	private readonly cacheKey = eventCacheKey;

	private readonly defaultExpiry: number;

	public constructor() {
		this.defaultExpiry = Time.Hour;
	}

	/**
	 * Get a guild's event settings.
	 * @param guildId - The ID of the guild
	 */
	public async get(guildId: string): Promise<EventSettings | null> {
		const key = this.cacheKey(guildId);

		const cacheResult = await container.redis.get<EventSettings>(key);
		if (!isNullish(cacheResult)) {
			await container.redis.updateExpiry(key, this.defaultExpiry);
			return cacheResult;
		}

		const dbResult = await container.prisma.eventSettings.findUnique({
			where: { guildId },
		});
		if (isNullish(dbResult)) {
			return null;
		}

		await container.redis.setEx(key, dbResult, this.defaultExpiry);
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
		},
	): Promise<EventSettings> {
		const key = this.cacheKey(guildId);

		const settings = await container.prisma.eventSettings.upsert({
			where: { guildId },
			update: data,
			create: {
				...data,
				coreSettings: {
					connectOrCreate: {
						where: { guildId },
						create: { guildId },
					},
				},
			},
		});
		await container.redis.setEx(key, settings, this.defaultExpiry);

		return settings;
	}
}
