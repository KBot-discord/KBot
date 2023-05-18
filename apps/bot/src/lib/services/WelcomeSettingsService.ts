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

	public async get(guildId: string): Promise<WelcomeSettings | null> {
		return this.repository.get({ guildId });
	}

	public async upsert(guildId: string, data: UpsertWelcomeSettingsData): Promise<WelcomeSettings> {
		return this.repository.upsert({ guildId }, data);
	}
}
