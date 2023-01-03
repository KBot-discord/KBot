import { UtilityRepository } from '#lib/database/repositories/UtilityRepository';

export class UtilityService {
	public readonly repo;

	public constructor() {
		this.repo = new UtilityRepository();
	}
}
