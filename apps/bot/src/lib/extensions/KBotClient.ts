import { KBotLogger } from '#extensions/KBotLogger';
import { transformLoginData } from '#utils/discord';
import { LogLevel, SapphireClient, container } from '@sapphire/framework';
import { ActivityType, IntentsBitField, OAuth2Scopes, WebhookClient } from 'discord.js';
import { Enumerable } from '@sapphire/decorators';

export class KBotClient extends SapphireClient {
	@Enumerable(false)
	public override readonly webhook: WebhookClient | null;

	public constructor() {
		const { config } = container;

		super({
			disableMentionPrefix: true,
			loadDefaultErrorListeners: false,
			loadApplicationCommandRegistriesStatusListeners: false,
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
				instance: new KBotLogger({
					level: LogLevel.Info,
					join: '\n'
				})
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
			grpc: {
				host: config.api.host,
				port: config.rpc.server.port,
				options: {
					connect: true,
					grpc: false,
					grpcWeb: false
				}
			},
			tasks: {
				bull: {
					connection: {
						host: config.redis.host,
						port: config.redis.port,
						password: config.redis.password
					},
					defaultJobOptions: { removeOnComplete: 0, removeOnFail: 0 }
				}
			},
			modules: {
				enabled: true,
				loadModuleErrorListeners: true
			}
		});

		this.webhook = config.isDev //
			? null
			: new WebhookClient({ url: config.discord.webhook });
	}

	public override async login(token: string): Promise<string> {
		return super.login(token);
	}

	public override async destroy(): Promise<void> {
		await Promise.allSettled([
			container.prisma.$disconnect(), //
			container.redis.quit(),
			this.grpc.close()
		]);

		void super.destroy();
	}
}
