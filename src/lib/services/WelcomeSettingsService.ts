import { welcomeCacheKey } from './keys.js';
import { Time } from '@sapphire/duration';
import { isNullish } from '@sapphire/utilities';
import { container } from '@sapphire/framework';
import type { WelcomeSettings } from '@prisma/client';

export class WelcomeSettingsService {
	private readonly cacheKey = welcomeCacheKey;

	private readonly defaultExpiry: number;

	public constructor() {
		this.defaultExpiry = Time.Hour;
	}

	/**
	 * Get a guild's welcome settings.
	 * @param guildId - The ID of the guild
	 */
	public async get(guildId: string): Promise<WelcomeSettings | null> {
		const key = this.cacheKey(guildId);

		const cacheResult = await container.redis.get<WelcomeSettings>(key);
		if (!isNullish(cacheResult)) {
			await container.redis.updateExpiry(key, this.defaultExpiry);
			return cacheResult;
		}

		const dbResult = await container.prisma.welcomeSettings.findUnique({
			where: { guildId }
		});
		if (isNullish(dbResult)) {
			return null;
		}

		await container.redis.setEx(key, dbResult, this.defaultExpiry);
		return dbResult;
	}

	/**
	 * Upsert a guild's welcome settings.
	 * @param guildId - The ID of the guild
	 * @param data - The settings to upsert
	 */
	public async upsert(
		guildId: string,
		data: {
			enabled?: boolean;
			channelId?: string | null;
			message?: string | null;
			title?: string | null;
			description?: string | null;
			image?: string | null;
			color?: string | null;
		}
	): Promise<WelcomeSettings> {
		const key = this.cacheKey(guildId);

		const settings = await container.prisma.welcomeSettings.upsert({
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
