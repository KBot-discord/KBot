import { ModerationSettingsRepository } from '#repositories/ModerationSettingsRepository';
import { container } from '@sapphire/framework';
import type { ModerationSettings } from '@prisma/client';
import type { UpsertModerationSettingsData } from '#repositories/types';

export class ModerationSettingsService {
	private readonly repository: ModerationSettingsRepository;

	public constructor() {
		const { prisma, redis, config } = container;

		this.repository = new ModerationSettingsRepository({
			database: prisma,
			cache: {
				client: redis,
				defaultExpiry: config.db.cacheExpiry
			}
		});
	}

	/**
	 * Get a guild's moderation settings.
	 * @param guildId - The ID of the guild
	 */
	public async get(guildId: string): Promise<ModerationSettings | null> {
		return this.repository.get({ guildId });
	}

	/**
	 * Upsert a guild's moderation settings.
	 * @param guildId - The ID of the guild
	 * @param data - The settings to upsert
	 */
	public async upsert(guildId: string, data: UpsertModerationSettingsData): Promise<ModerationSettings> {
		return this.repository.upsert({ guildId }, data);
	}
}
