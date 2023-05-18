import { container } from '@sapphire/framework';
import { ModerationSettingsRepository } from '@kbotdev/database';
import type { ModerationSettings, UpsertModerationSettingsData } from '@kbotdev/database';

export class ModerationSettingsService {
	private readonly repository: ModerationSettingsRepository;

	public constructor() {
		this.repository = new ModerationSettingsRepository({
			database: container.prisma,
			cache: {
				client: container.redis
			}
		});
	}

	public async get(guildId: string): Promise<ModerationSettings | null> {
		return this.repository.get({ guildId });
	}

	public async upsert(guildId: string, data: UpsertModerationSettingsData): Promise<ModerationSettings> {
		return this.repository.upsert({ guildId }, data);
	}
}
