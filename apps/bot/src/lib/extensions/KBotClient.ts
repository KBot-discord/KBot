import { KBotLogger } from '#lib/extensions/KBotLogger';
import { LogLevel, SapphireClient, container } from '@sapphire/framework';
import { ActivityType, IntentsBitField, WebhookClient } from 'discord.js';
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
				listenOptions: {
					port: config.api.port
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
			}
		});

		this.webhook = config.isDev //
			? null
			: new WebhookClient({ url: config.discord.webhook });
	}

	public override async login(token: string): Promise<string> {
		return await super.login(token);
	}

	public override async destroy(): Promise<void> {
		await Promise.allSettled([
			container.prisma.$disconnect(), //
			container.redis.client.quit()
		]);

		void super.destroy();
	}
}
