import type { IncidentMessage, Prisma, PrismaClient } from '@kbotdev/prisma';
import type { ServiceOptions } from '../lib/types';

export class DiscordIncidentRepository {
	private readonly database: PrismaClient;

	public constructor({ database }: Omit<ServiceOptions, 'cache'>) {
		this.database = database;
	}

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

	public async deleteManyIncidentsNotInArray(incidentsIds: string[]): Promise<Prisma.BatchPayload> {
		return this.database.discordIncident.deleteMany({
			where: { NOT: { id: { in: incidentsIds } } }
		});
	}
}
