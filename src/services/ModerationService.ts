import { container } from '@sapphire/framework';
import { ModerationRepository } from '../lib/database/repositories/ModerationRepository';

export class ModerationService {
	public readonly repo;

	public constructor() {
		this.repo = new ModerationRepository();
		container.logger.info('Moderation service loaded.');
	}
}
