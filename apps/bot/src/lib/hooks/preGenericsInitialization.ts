import { rootFolder } from '#utils/constants';
import { Validator } from '#utils/validators';
import { KBotMetrics } from '#observability/KBotMetrics';
import { RedisClient } from '#extensions/RedisClient';
import { MeilisearchClient } from '#extensions/MeiliClient';
import { PrismaClient } from '#prisma';
import { RewriteFrames } from '@sentry/integrations';
import * as Sentry from '@sentry/node';
import { container, Plugin, preGenericsInitialization } from '@sapphire/framework';
import { Holodex } from '@kbotdev/holodex';
import type { SapphireClient } from '@sapphire/framework';

export class PreGenericsInitializationHook extends Plugin {
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
			container.redis = new RedisClient();
			container.meili = new MeilisearchClient();
			container.holodex = new Holodex({ apiKey: config.holodex.apiKey });

			void container.meili.sync();
		} catch (err: unknown) {
			container.logger.fatal(err);
			this.destroy();
			process.exit(1);
		}
	}
}
