import { UtilitySettingsRepository } from '#repositories/UtilitySettingsRepository';
import { container } from '@sapphire/framework';
import type { UtilitySettings } from '@prisma/client';
import type { UpsertUtilitySettingsData } from '#repositories/types';

export class UtilitySettingsService {
	private readonly repository: UtilitySettingsRepository;

	public constructor() {
		const { prisma, redis, config } = container;

		this.repository = new UtilitySettingsRepository({
			database: prisma,
			cache: {
				client: redis,
				defaultExpiry: config.db.cacheExpiry
			}
		});
	}

	/**
	 * Get a guild's utility settings.
	 * @param guildId - The ID of the guild
	 */
	public async get(guildId: string): Promise<UtilitySettings | null> {
		return this.repository.get({ guildId });
	}

	/**
	 * Upsert a guild's utility settings.
	 * @param guildId - The ID of the guild
	 * @param data - The settings to upsert
	 */
	public async upsert(guildId: string, data: UpsertUtilitySettingsData): Promise<UtilitySettings> {
		return this.repository.upsert({ guildId }, data);
	}

	/**
	 * Get all of the valid Discord incident channels for notifications.
	 */
	public async getIncidentChannels(): Promise<{ guildId: string; channelId: string }[]> {
		return this.repository.getIncidentChannels();
	}
}
