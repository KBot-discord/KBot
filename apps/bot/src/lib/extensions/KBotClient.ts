import { transformLoginData } from '#utils/Discord';
import { container, LogLevel, SapphireClient } from '@sapphire/framework';
import { ActivityType, IntentsBitField, OAuth2Scopes } from 'discord.js';
import { ScheduledTaskRedisStrategy } from '@sapphire/plugin-scheduled-tasks/register-redis';

export class KBotClient extends SapphireClient {
	public constructor() {
		const { config } = container;
		super({
			disableMentionPrefix: true,
			intents: [
				IntentsBitField.Flags.Guilds,
				IntentsBitField.Flags.GuildMembers,
				IntentsBitField.Flags.GuildVoiceStates,
				IntentsBitField.Flags.GuildScheduledEvents,
				IntentsBitField.Flags.GuildEmojisAndStickers
			],
			allowedMentions: {},
			presence: {
				status: 'online',
				activities: [{ name: '/help', type: ActivityType.Playing }]
			},
			logger: {
				level: config.isDev ? LogLevel.Debug : LogLevel.Info
			},
			api: {
				origin: config.web.url,
				listenOptions: {
					port: config.api.port
				},
				auth: {
					id: config.discord.id,
					secret: config.discord.secret,
					cookie: config.api.auth.cookie,
					scopes: [OAuth2Scopes.Identify, OAuth2Scopes.Guilds],
					domainOverwrite: config.api.auth.domain,
					transformers: [transformLoginData]
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
		});
	}

	public override async login(token: string): Promise<string> {
		return super.login(token);
	}

	public override async destroy(): Promise<void> {
		await Promise.allSettled([
			container.prisma.$disconnect(), //
			container.redis.quit()
		]);
		return super.destroy();
	}
}
