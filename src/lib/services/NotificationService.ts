import { NotificationRepository } from '#lib/database/repositories/NotificationRepository';

export class NotificationService {
	public readonly repo;

	public constructor() {
		this.repo = new NotificationRepository();
	}
}
