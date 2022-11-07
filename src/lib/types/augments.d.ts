/* eslint-disable @typescript-eslint/no-invalid-void-type */
// Imports
import type { APIMessage } from 'discord-api-types/v10';
import type { Message } from 'discord.js';
import type { Config } from './config';
import type { Metrics } from './client';
import type { DatabaseClient } from '../database/DatabaseClient';
import type { RedisClient } from '../redis/RedisClient';
import type { PollService } from '../../services/PollService';
import type { KaraokeService } from '../../services/KaraokeService';

declare module 'discord.js' {
	interface BaseCommandInteraction {
		defaultReply(text: string): Promise<void | APIMessage | Message<boolean>>;
		successReply(text: string): Promise<void | APIMessage | Message<boolean>>;
		errorReply(text: string): Promise<void | APIMessage | Message<boolean>>;
	}
}

declare module '@sapphire/pieces' {
	interface Container {
		config: Config;
		metrics: Metrics;
		db: DatabaseClient;
		redis: RedisClient;
		polls: PollService;
		karaoke: KaraokeService;
	}
}
