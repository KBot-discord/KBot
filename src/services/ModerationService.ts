import { container } from '@sapphire/framework';

export class ModerationService {
	public readonly db;

	public constructor() {
		this.db = container.db.moderationModule;
		container.logger.info('Moderation service loaded.');
	}
}
