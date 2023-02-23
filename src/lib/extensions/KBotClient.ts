import { Validator } from '#utils/validators';
import { PrismaClient } from '#prisma';
import { RedisClient } from '#lib/extensions/RedisClient';
import { KBotMetrics } from '#lib/observability/metrics';
import { rootFolder } from '#utils/constants';
import { container, LogLevel, SapphireClient } from '@sapphire/framework';
import { IntentsBitField } from 'discord.js';
import { ScheduledTaskRedisStrategy } from '@sapphire/plugin-scheduled-tasks/register-redis';
import * as Sentry from '@sentry/node';
import { RewriteFrames } from '@sentry/integrations';
import type { ClientOptions } from 'discord.js';

export class KBotClient extends SapphireClient {
	public constructor(options: ClientOptions) {
		super(options);
	}

	public override async login(token: string): Promise<string> {
		return super.login(token);
	}

	public override async destroy(): Promise<void> {
		await container.prisma.$disconnect();
		container.redis.disconnect();
		return super.destroy();
	}

	public static async preLogin(): Promise<ClientOptions> {
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

		return {
			intents: [
				IntentsBitField.Flags.Guilds,
				IntentsBitField.Flags.GuildMembers,
				IntentsBitField.Flags.GuildVoiceStates,
				IntentsBitField.Flags.GuildScheduledEvents
			],
			allowedMentions: {},
			presence: {
				status: 'online',
				activities: [{ name: '/help', type: 0 }]
			},
			logger: {
				level: config.isDev ? LogLevel.Debug : LogLevel.Info
			},
			api: {
				listenOptions: {
					port: config.api.port
				}
			},
			tasks: {
				strategy: new ScheduledTaskRedisStrategy({
					bull: {
						connection: {
							host: config.redis.host,
							port: config.redis.port,
							password: config.redis.password
						},
						defaultJobOptions: { removeOnComplete: 0, removeOnFail: 0 }
					}
				})
			},
			modules: {
				enabled: true,
				loadModuleErrorListeners: true
			}
		};
	}
}
