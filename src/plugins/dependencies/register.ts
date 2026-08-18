import { RedisClient } from '@killbasa/redis-utils';
import { PrismaPg } from '@prisma/adapter-pg';
import { container, Plugin, preGenericsInitialization, SapphireClient } from '@sapphire/framework';
import { PrismaClient } from '../../db/client.js';
import { KBotMetrics } from '../../lib/observability/KBotMetrics.js';
import { Validator } from '../../lib/structures/Validator.js';

export class DependenciesPlugin extends Plugin {
	public static override [preGenericsInitialization](this: SapphireClient): void {
		try {
			container.validator = new Validator();
			container.metrics = new KBotMetrics();

			const adapter = new PrismaPg({
				connectionString: container.config.db.url,
			});
			container.prisma = new PrismaClient({ adapter });
			container.redis = new RedisClient(container.config.redis);
		} catch (error) {
			container.logger.error(error);
			void container.client.destroy();
			process.exit(1);
		}
	}
}

SapphireClient.plugins.registerPreGenericsInitializationHook(
	DependenciesPlugin[preGenericsInitialization],
	'Dependencies-PreGenericsInitialization',
);
