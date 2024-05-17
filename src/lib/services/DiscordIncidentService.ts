import type { IncidentMessage } from '@prisma/client';
import { container } from '@sapphire/framework';

export class DiscordIncidentService {
	/**
	 * Get many incidents.
	 * @param incidentIds - The incident IDs to get
	 */
	public async getIncidents(
		incidentIds: string[],
	): Promise<{ id: string; updatedAt: Date; messages: IncidentMessage[] }[]> {
		return await container.prisma.discordIncident.findMany({
			where: { id: { in: incidentIds } },
			select: { id: true, updatedAt: true, messages: true },
		});
	}

	/**
	 * Deletes any incidents which are NOT present in the array.
	 * @param incidentIds - The incident IDs to NOT delete
	 * @returns The number of deleted incidents
	 */
	public async cleanupIncidents(incidentIds: string[]): Promise<number> {
		const result = await container.prisma.discordIncident.deleteMany({
			where: { NOT: { id: { in: incidentIds } } },
		});

		return result.count;
	}
}
