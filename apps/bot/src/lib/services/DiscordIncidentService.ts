import { DiscordIncidentRepository } from '#repositories/DiscordIncidentRepository';
import { container } from '@sapphire/framework';
import type { IncidentMessage } from '@prisma/client';

export class DiscordIncidentService {
	private readonly repository: DiscordIncidentRepository;

	public constructor() {
		this.repository = new DiscordIncidentRepository({
			database: container.prisma
		});
	}

	/**
	 * Get many incidents.
	 * @param incidentIds - The incident IDs to get
	 */
	public async getIncidents(incidentIds: string[]): Promise<{ id: string; updatedAt: Date; messages: IncidentMessage[] }[]> {
		return this.repository.getManyIncidentsInArray(incidentIds);
	}

	/**
	 * Deletes any incidents which are NOT present in the array.
	 * @param incidentIds - The incident IDs to NOT delete
	 * @returns The number of deleted incidents
	 */
	public async cleanupIncidents(incidentIds: string[]): Promise<number> {
		const result = await this.repository.deleteManyIncidentsNotInArray(incidentIds);
		return result.count;
	}
}
