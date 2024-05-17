import type { UtilitySettings } from '@prisma/client';
import { Time } from '@sapphire/duration';
import { container } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import { utilityCacheKey } from './keys.js';

export class UtilitySettingsService {
	private readonly cacheKey = utilityCacheKey;

	private readonly defaultExpiry: number;

	public constructor() {
		this.defaultExpiry = Time.Hour;
	}

	/**
	 * Get a guild's utility settings.
	 * @param guildId - The ID of the guild
	 */
	public async get(guildId: string): Promise<UtilitySettings | null> {
		const key = this.cacheKey(guildId);

		const cacheResult = await container.redis.get<UtilitySettings>(key);
		if (!isNullish(cacheResult)) {
			await container.redis.updateExpiry(key, this.defaultExpiry);
			return cacheResult;
		}

		const dbResult = await container.prisma.utilitySettings.findUnique({
			where: { guildId },
		});
		if (isNullish(dbResult)) {
			return null;
		}

		await container.redis.setEx(key, dbResult, this.defaultExpiry);
		return dbResult;
	}

	/**
	 * Upsert a guild's utility settings.
	 * @param guildId - The ID of the guild
	 * @param data - The settings to upsert
	 */
	public async upsert(
		guildId: string,
		data: {
			enabled?: boolean;
			incidentChannelId?: string | null;
			creditsChannelId?: string | null;
		},
	): Promise<UtilitySettings> {
		const key = this.cacheKey(guildId);

		const settings = await container.prisma.utilitySettings.upsert({
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

	/**
	 * Get all of the valid Discord incident channels for notifications.
	 */
	public async getIncidentChannels(): Promise<{ guildId: string; channelId: string }[]> {
		return await container.prisma.utilitySettings
			.findMany({
				where: { AND: { enabled: true, NOT: { incidentChannelId: null } } },
				select: { guildId: true, incidentChannelId: true },
			})
			.then((res) =>
				res //
					.filter((settings) => !isNullish(settings.incidentChannelId))
					.map(({ guildId, incidentChannelId }) => ({ guildId, channelId: incidentChannelId! })),
			);
	}
}
