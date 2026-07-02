import { container, LogLevel, SapphireClient } from '@sapphire/framework';
import { ActivityType, IntentsBitField } from 'discord.js';
import { KBotLogger } from './KBotLogger.js';

export class KBotClient extends SapphireClient {
	public constructor() {
		const { config } = container;

		super({
			disableMentionPrefix: true,
			loadDefaultErrorListeners: false,
			loadApplicationCommandRegistriesStatusListeners: false,
			intents: [
				IntentsBitField.Flags.Guilds,
				IntentsBitField.Flags.GuildMembers,
				IntentsBitField.Flags.GuildExpressions,
			],
			allowedMentions: {},
			presence: {
				status: 'online',
				activities: [{ name: '/help', type: ActivityType.Playing }],
			},
			logger: {
				instance: new KBotLogger({
					level: LogLevel.Info,
					join: '\n',
				}),
			},
			api: {
				listenOptions: {
					port: config.api.port,
				},
			},
		});
	}
}
