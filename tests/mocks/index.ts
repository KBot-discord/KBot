import { LogLevel } from '@sapphire/framework';
import { ScheduledTaskRedisStrategy } from '@sapphire/plugin-scheduled-tasks/register-redis';
import { Intents } from 'discord.js';
import { config } from '../../src/config';
import { KBotClient } from '../../src/lib/extensions/KBotClient';

export const client = new KBotClient({
	intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_SCHEDULED_EVENTS],
	presence: {
		status: 'online',
		activities: [{ name: '/help', type: 0 }]
	},
	logger: {
		level: LogLevel.Warn
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
				}
			}
		})
	}
});

export const discordEmoji = '';
export const imageLink = '';
