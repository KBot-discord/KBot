import { container } from '@sapphire/framework';
import { UtilityRepository } from '../lib/database/repositories/UtilityRepository';

export class UtilityService {
	public readonly repo;

	public constructor() {
		this.repo = new UtilityRepository();
		container.logger.info('Utility service loaded.');
	}
}
