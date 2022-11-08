// Imports
import { PrismaClient } from '@prisma/client';
import { container } from '@sapphire/framework';

export class DatabaseClient extends PrismaClient {
	public constructor() {
		super({
			datasources: {
				database: {
					url: container.config.db.url
				}
			}
		});
	}

	public async getGuild(guildId: string) {
		return super.guild.findUnique({
			where: {
				id: guildId
			}
		});
	}
}
