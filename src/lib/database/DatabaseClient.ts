// Imports
import { PrismaClient } from "@prisma/client";


export class DatabaseClient extends PrismaClient {
    public constructor(connectionUrl: string) {
        super({ datasources: { db: { url: connectionUrl } } });
    }
}