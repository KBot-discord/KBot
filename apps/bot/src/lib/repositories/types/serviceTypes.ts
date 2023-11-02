import type { RedisClient } from '@killbasa/redis-utils';
import type { PrismaClient } from '@prisma/client';

export type ServiceOptions = {
	database: PrismaClient;
	cache: {
		client: RedisClient;
		defaultExpiry?: number;
	};
};
