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

	public async get(guildId: string): Promise<YoutubeSettings | null> {
		return this.repository.get({ guildId });
	}

	public async upsert(guildId: string, data: UpsertYoutubeSettingsData): Promise<YoutubeSettings> {
		return this.repository.upsert({ guildId }, data);
	}
}
