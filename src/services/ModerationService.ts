import { ModerationRepository } from '#lib/database/repositories/ModerationRepository';
import { container } from '@sapphire/framework';

export class ModerationService {
	public readonly repo;

	public constructor() {
		this.repo = new ModerationRepository();
		container.logger.info('Moderation service loaded.');
	}
}
