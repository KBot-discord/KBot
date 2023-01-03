import { ModerationRepository } from '#lib/database/repositories/ModerationRepository';

export class ModerationService {
	public readonly repo;

	public constructor() {
		this.repo = new ModerationRepository();
	}
}
