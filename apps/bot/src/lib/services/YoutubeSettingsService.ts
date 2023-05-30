import { container } from '@sapphire/framework';
import { YoutubeSettingsRepository } from '@kbotdev/database';
import type { UpsertYoutubeSettingsData, YoutubeSettings } from '@kbotdev/database';

export class YoutubeSettingsService {
	private readonly repository: YoutubeSettingsRepository;

	public constructor() {
		this.repository = new YoutubeSettingsRepository({
			database: container.prisma,
			cache: {
				client: container.redis
			}
		});
	}

	/**
	 * Get a guild's YouTube settings.
	 * @param guildId - The ID of the guild
	 */
	public async get(guildId: string): Promise<YoutubeSettings | null> {
		return this.repository.get({ guildId });
	}

	/**
	 * Upsert a guild's YouTube settings.
	 * @param guildId - The ID of the guild
	 * @param data - The settings to upsert
	 */
	public async upsert(guildId: string, data: UpsertYoutubeSettingsData): Promise<YoutubeSettings> {
		return this.repository.upsert({ guildId }, data);
	}
}
