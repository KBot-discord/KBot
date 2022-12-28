import { UtilityRepository } from '#lib/database/repositories/UtilityRepository';
import { container } from '@sapphire/framework';

export class UtilityService {
	public readonly repo;

	public constructor() {
		this.repo = new UtilityRepository();
		container.logger.info('Utility service loaded.');
	}
}
