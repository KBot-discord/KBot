import type { RedisClient } from '@kbotdev/redis';
import type { PrismaClient } from '@kbotdev/prisma';

export type ServiceOptions = {
	database: PrismaClient;
	cache: {
		client: RedisClient;
		defaultExpiry?: number;
	};
};
