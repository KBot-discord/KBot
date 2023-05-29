import { container } from '@sapphire/framework';
import { CoreSettingsRepository } from '@kbotdev/database';
import type { CoreSettings, UpsertCoreSettingsData } from '@kbotdev/database';

export class CoreSettingsService {
	private readonly repository: CoreSettingsRepository;

	public constructor() {
		this.repository = new CoreSettingsRepository({
			database: container.prisma,
			cache: {
				client: container.redis
			}
		});
	}

	public async get(guildId: string): Promise<CoreSettings | null> {
		return this.repository.get({ guildId });
	}

	public async upsert(guildId: string, data: UpsertCoreSettingsData = {}): Promise<CoreSettings> {
		return this.repository.upsert({ guildId }, data);
	}

	public async delete(guildId: string): Promise<CoreSettings | null> {
		return this.repository.delete({ guildId });
	}
}
