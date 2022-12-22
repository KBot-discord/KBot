/* eslint-disable @typescript-eslint/no-invalid-void-type */
import type { APIMessage } from 'discord-api-types/v10';
import type { Message } from 'discord.js';
import type { Config } from './Config';
import type { Metrics } from './Client';
import type { RedisClient } from '../database/RedisClient';
import type { PrismaClient } from '@prisma/client';
import type { PollService } from '../../services/PollService';
import type { KaraokeService } from '../../services/KaraokeService';
import type { YoutubeService } from '../../services/YoutubeService';
import type { Validator } from '../util/validators';
import type { KBotErrors, Payload } from './Errors';

declare module 'discord.js' {
	interface Client {
		emitError(event: KBotErrors, payload: Payload<typeof event>): boolean;
	}

	interface BaseCommandInteraction {
		defaultReply(text: string): Promise<void | APIMessage | Message<boolean>>;
		successReply(text: string): Promise<void | APIMessage | Message<boolean>>;
		errorReply(text: string): Promise<void | APIMessage | Message<boolean>>;
	}

	interface MessageComponentInteraction {
		defaultReply(text: string): Promise<void | APIMessage | Message<boolean>>;
		successReply(text: string): Promise<void | APIMessage | Message<boolean>>;
		errorReply(text: string): Promise<void | APIMessage | Message<boolean>>;
	}

	interface ModalSubmitInteraction {
		defaultReply(text: string): Promise<void | APIMessage | Message<boolean>>;
		successReply(text: string): Promise<void | APIMessage | Message<boolean>>;
		errorReply(text: string): Promise<void | APIMessage | Message<boolean>>;
	}

	interface BaseGuildVoiceChannel {
		isStageChannel(): boolean;
		isVoiceChannel(): boolean;
	}
}

declare module '@sapphire/pieces' {
	interface Container {
		config: Config;
		validator: Validator;
		metrics: Metrics;
		db: PrismaClient;
		redis: RedisClient;
		polls: PollService;
		karaoke: KaraokeService;
		youtube: YoutubeService;
	}
}
