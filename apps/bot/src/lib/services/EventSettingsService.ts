import { container } from '@sapphire/framework';
import { EventSettingsRepository } from '@kbotdev/database';
import type { UpsertEventSettingsData } from '@kbotdev/database';
import type { EventSettings } from '@kbotdev/prisma';

export class EventSettingsService {
	private readonly repository: EventSettingsRepository;

	public constructor() {
		this.repository = new EventSettingsRepository({
			database: container.prisma,
			cache: {
				client: container.redis
			}
		});
	}

	public async get(guildId: string): Promise<EventSettings | null> {
		return this.repository.get({ guildId });
	}

	public async upsert(guildId: string, data: UpsertEventSettingsData): Promise<EventSettings> {
		return this.repository.upsert({ guildId }, data);
	}
}
