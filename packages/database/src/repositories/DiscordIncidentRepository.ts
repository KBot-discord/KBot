import type { IncidentMessage, Prisma, PrismaClient } from '@kbotdev/prisma';
import type { ServiceOptions } from '../lib/types';

/**
 * Repository that handles database operations for Discord incidents.
 */
export class DiscordIncidentRepository {
	private readonly database: PrismaClient;

	public constructor({ database }: Omit<ServiceOptions, 'cache'>) {
		this.database = database;
	}

	/**
	 * Get Discord incidents of the provided IDs.
	 * @param incidentIds - The incidents to query
	 */
	public async getManyIncidentsInArray(incidentIds: string[]): Promise<
		{
			id: string;
			updatedAt: Date;
			messages: IncidentMessage[];
		}[]
	> {
		return this.database.discordIncident.findMany({
			where: { id: { in: incidentIds } },
			select: { id: true, updatedAt: true, messages: true }
		});
	}

	/**
	 * Delete any Discord incidents that are NOT in the array.
	 * @param incidentsIds - The IDs of the incidents to not delete
	 */
	public async deleteManyIncidentsNotInArray(incidentsIds: string[]): Promise<Prisma.BatchPayload> {
		return this.database.discordIncident.deleteMany({
			where: { NOT: { id: { in: incidentsIds } } }
		});
	}
}
