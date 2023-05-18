import { container } from '@sapphire/framework';
import { UtilitySettingsRepository } from '@kbotdev/database';
import type { UpsertUtilitySettingsData, UtilitySettings } from '@kbotdev/database';

export class UtilitySettingsService {
	private readonly repository: UtilitySettingsRepository;

	public constructor() {
		this.repository = new UtilitySettingsRepository({
			database: container.prisma,
			cache: {
				client: container.redis
			}
		});
	}

	public async get(guildId: string): Promise<UtilitySettings | null> {
		return this.repository.get({ guildId });
	}

	public async upsert(guildId: string, data: UpsertUtilitySettingsData): Promise<UtilitySettings> {
		return this.repository.upsert({ guildId }, data);
	}

	public async getIncidentChannels(): Promise<{ guildId: string; channelId: string }[]> {
		return this.repository.getIncidentChannels();
	}
}
