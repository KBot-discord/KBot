import { container } from '@sapphire/framework';
import { CoreSettingsRepository } from '@kbotdev/database';
import type { CoreSettings, UpsertCoreSettingsData } from '@kbotdev/database';

export class CoreSettingsService {
	private readonly repository: CoreSettingsRepository;

	public constructor() {
		const { prisma, redis, config } = container;

		this.repository = new CoreSettingsRepository({
			database: prisma,
			cache: {
				client: redis,
				defaultExpiry: config.db.cacheExpiry
			}
		});
	}

	/**
	 * Get a guild's core settings.
	 * @param guildId - The ID of the guild
	 */
	public async get(guildId: string): Promise<CoreSettings | null> {
		return this.repository.get({ guildId });
	}

	/**
	 * Upsert a guild's core settings.
	 * @param guildId - The ID of the guild
	 * @param data - The settings to upsert
	 */
	public async upsert(guildId: string, data: UpsertCoreSettingsData = {}): Promise<CoreSettings> {
		return this.repository.upsert({ guildId }, data);
	}

	/**
	 * Delete a guild's core settings.
	 * @param guildId - The ID of the guild
	 */
	public async delete(guildId: string): Promise<CoreSettings | null> {
		return this.repository.delete({ guildId });
	}
}
