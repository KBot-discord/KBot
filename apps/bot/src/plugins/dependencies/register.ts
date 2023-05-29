import { rootFolder } from '#utils/constants';
import { Validator } from '#utils/validators';
import { KBotMetrics } from '#observability/KBotMetrics';
import { MeilisearchClient } from '@kbotdev/meili';
import { RedisClient } from '@kbotdev/redis';
import { PrismaClient } from '@kbotdev/database';
import { RewriteFrames } from '@sentry/integrations';
import * as Sentry from '@sentry/node';
import { Plugin, SapphireClient, container, preGenericsInitialization } from '@sapphire/framework';
import { Holodex } from '@kbotdev/holodex';

export class DependenciesPlugin extends Plugin {
	public static [preGenericsInitialization](this: SapphireClient): void {
		try {
			const { config } = container;

			if (!config.isDev) {
				Sentry.init({
					dsn: config.sentry.dsn,
					tracesSampleRate: 0.2,
					integrations: [
						new Sentry.Integrations.Modules(),
						new Sentry.Integrations.FunctionToString(),
						new Sentry.Integrations.LinkedErrors(),
						new Sentry.Integrations.Console(),
						new Sentry.Integrations.Http({ breadcrumbs: true, tracing: true }),
						new RewriteFrames({ root: rootFolder })
					]
				});
			}

			container.validator = new Validator();
			container.metrics = new KBotMetrics();

			container.prisma = new PrismaClient({
				datasources: {
					database: {
						url: container.config.db.url
					}
				}
			});
			container.redis = new RedisClient(container.config.redis);
			container.meili = new MeilisearchClient(config.meili);
			container.holodex = new Holodex({ apiKey: config.holodex.apiKey });

			void container.meili.sync();
		} catch (error: unknown) {
			container.logger.sentryError(error);
			this.destroy();
			process.exit(1);
		}
	}
}

SapphireClient.plugins.registerPreGenericsInitializationHook(DependenciesPlugin[preGenericsInitialization], 'Dependencies-PreGenericsInitialization');
