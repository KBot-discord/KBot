import { container } from '@sapphire/framework';
import { WelcomeSettingsRepository } from '@kbotdev/database';
import type { UpsertWelcomeSettingsData, WelcomeSettings } from '@kbotdev/database';

export class WelcomeSettingsService {
	private readonly repository: WelcomeSettingsRepository;

	public constructor() {
		this.repository = new WelcomeSettingsRepository({
			database: container.prisma,
			cache: {
				client: container.redis
			}
		});
	}

	/**
	 * Get a guild's welcome settings.
	 * @param guildId - The ID of the guild
	 */
	public async get(guildId: string): Promise<WelcomeSettings | null> {
		return this.repository.get({ guildId });
	}

	/**
	 * Upsert a guild's welcome settings.
	 * @param guildId - The ID of the guild
	 * @param data - The settings to upsert
	 */
	public async upsert(guildId: string, data: UpsertWelcomeSettingsData): Promise<WelcomeSettings> {
		return this.repository.upsert({ guildId }, data);
	}
}
