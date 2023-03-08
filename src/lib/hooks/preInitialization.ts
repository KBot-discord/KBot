import { rootFolder } from '#utils/constants';
import { Validator } from '#utils/validators';
import { KBotMetrics } from '#observability/KBotMetrics';
import { PrismaClient } from '#prisma';
import { RedisClient } from '#extensions/RedisClient';
import { MeilisearchClient } from '#extensions/MeiliClient';
import { RewriteFrames } from '@sentry/integrations';
import * as Sentry from '@sentry/node';
import { container, Plugin, preInitialization } from '@sapphire/framework';
import type { SapphireClient } from '@sapphire/framework';

export class PreInitializationHook extends Plugin {
	public static [preInitialization](this: SapphireClient): void {
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

			void container.meili.sync();
		} catch (err: unknown) {
			container.logger.fatal(err);
			this.destroy();
			process.exit(1);
		}
	}
}
