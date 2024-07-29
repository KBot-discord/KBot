import { RedisClient } from '@killbasa/redis-utils';
import { PrismaClient } from '@prisma/client';
import { Plugin, SapphireClient, container, preGenericsInitialization } from '@sapphire/framework';
import * as Sentry from '@sentry/node';
import { Holodex } from '../../lib/holodex/structures/Holodex.js';
import { MeilisearchClient } from '../../lib/meili/structures/MeiliClient.js';
import { KBotMetrics } from '../../lib/observability/KBotMetrics.js';
import { Validator } from '../../lib/structures/Validator.js';

// biome-ignore lint/complexity/noStaticOnlyClass:
export class DependenciesPlugin extends Plugin {
	public static [preGenericsInitialization](this: SapphireClient): void {
		try {
			const { config } = container;

			if (!config.isDev) {
				Sentry.init({
					dsn: config.sentry.dsn,
					tracesSampleRate: 0.2,
					integrations: [
						Sentry.modulesIntegration(),
						Sentry.functionToStringIntegration(),
						Sentry.linkedErrorsIntegration(),
						Sentry.consoleIntegration(),
						Sentry.httpIntegration({ breadcrumbs: true }),
					],
				});
			}

			container.validator = new Validator();
			container.metrics = new KBotMetrics();

			container.prisma = new PrismaClient({
				datasources: {
					database: {
						url: container.config.db.url,
					},
				},
			});
			container.redis = new RedisClient(container.config.redis);
			container.meili = new MeilisearchClient(config.meili);
			container.holodex = new Holodex({ apiKey: config.holodex.apiKey });

			void container.meili.sync();
		} catch (error: unknown) {
			container.logger.sentryError(error);
			void container.client.destroy();
			process.exit(1);
		}
	}
}

SapphireClient.plugins.registerPreGenericsInitializationHook(
	DependenciesPlugin[preGenericsInitialization],
	'Dependencies-PreGenericsInitialization',
);
