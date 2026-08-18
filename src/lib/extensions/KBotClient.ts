import { LogLevel, SapphireClient } from '@sapphire/framework';
import { IntentsBitField } from 'discord.js';
import { KBotLogger } from './KBotLogger.js';

export class KBotClient extends SapphireClient {
	public constructor() {
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
			},
			logger: {
				instance: new KBotLogger({
					level: LogLevel.Info,
					join: '\n',
				}),
			},
		});
	}
}
