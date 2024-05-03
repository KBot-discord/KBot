import { coreCacheKey } from './keys.js';
import { Time } from '@sapphire/duration';
import { isNullish } from '@sapphire/utilities';
import { container } from '@sapphire/framework';
import type { CoreSettings, FeatureFlags } from '@prisma/client';

export class CoreSettingsService {
	private readonly cacheKey = coreCacheKey;

	private readonly defaultExpiry: number;

	public constructor() {
		this.defaultExpiry = Time.Hour;
	}

	/**
	 * Get a guild's core settings.
	 * @param guildId - The ID of the guild
	 */
	public async get(guildId: string): Promise<CoreSettings | null> {
		const key = this.cacheKey(guildId);

		const cacheResult = await container.redis.get<CoreSettings>(key);
		if (!isNullish(cacheResult)) {
			await container.redis.updateExpiry(key, this.defaultExpiry);
			return cacheResult;
		}

		const dbResult = await container.prisma.coreSettings.findUnique({
			where: { guildId }
		});
		if (isNullish(dbResult)) {
			return null;
		}

		await container.redis.setEx(key, dbResult, this.defaultExpiry);
		return dbResult;
	}

	/**
	 * Upsert a guild's core settings.
	 * @param guildId - The ID of the guild
	 * @param data - The settings to upsert
	 */
	public async upsert(
		guildId: string, //
		data: { flags?: FeatureFlags[] } = {}
	): Promise<CoreSettings> {
		const key = this.cacheKey(guildId);

		const settings = await container.prisma.coreSettings.upsert({
			where: { guildId },
			update: data,
			create: { ...data, guildId }
		});
		await container.redis.setEx(key, settings, this.defaultExpiry);

		return settings;
	}

	/**
	 * Delete a guild's core settings.
	 * @param guildId - The ID of the guild
	 */
	public async delete(guildId: string): Promise<CoreSettings | null> {
		const key = this.cacheKey(guildId);

		await container.redis.delete(key);

		return await container.prisma.coreSettings
			.delete({
				where: { guildId }
			})
			.catch(() => null);
	}
}
