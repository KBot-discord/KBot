/* eslint-disable @typescript-eslint/no-invalid-void-type */
import type { NotificationService } from '#services/NotificationService';
import type { APIMessage } from 'discord-api-types/v10';
import type { Message, InteractionResponse } from 'discord.js';
import type { Config } from './Config';
import type { Metrics } from './Client';
import type { RedisClient } from '../database/RedisClient';
import type { PrismaClient } from '@prisma/client';
import type { PollService } from '#services/PollService';
import type { KaraokeService } from '#services/KaraokeService';
import type { YoutubeService } from '#services/YoutubeService';
import type { Validator } from '#utils/validators';
import type { KBotErrors } from '#utils/constants';
import type { Payload } from './Errors';
import type { ModerationService } from '#services/ModerationService';
import type { UtilityService } from '#services/UtilityService';

export type InteractionResponseUnion = void | APIMessage | Message<boolean> | InteractionResponse<boolean>;

declare module 'discord.js' {
	interface Client {
		emitError(event: KBotErrors, payload: Payload<typeof event>): boolean;
	}

	interface CommandInteraction {
		defaultReply(text: string, tryEphemeral?: boolean): Promise<InteractionResponseUnion>;
		successReply(text: string, tryEphemeral?: boolean): Promise<InteractionResponseUnion>;
		errorReply(text: string, tryEphemeral?: boolean): Promise<InteractionResponseUnion>;
	}

	interface MessageComponentInteraction {
		defaultReply(text: string, tryEphemeral?: boolean): Promise<InteractionResponseUnion>;
		successReply(text: string, tryEphemeral?: boolean): Promise<InteractionResponseUnion>;
		errorReply(text: string, tryEphemeral?: boolean): Promise<InteractionResponseUnion>;
	}

	interface ModalSubmitInteraction {
		defaultReply(text: string, tryEphemeral?: boolean): Promise<InteractionResponseUnion>;
		successReply(text: string, tryEphemeral?: boolean): Promise<InteractionResponseUnion>;
		errorReply(text: string, tryEphemeral?: boolean): Promise<InteractionResponseUnion>;
	}

	interface CommandInteraction {
		defaultFollowup(text: string, ephemeral?: boolean): Promise<InteractionResponseUnion>;
		successFollowup(text: string, ephemeral?: boolean): Promise<InteractionResponseUnion>;
		errorFollowup(text: string, ephemeral?: boolean): Promise<InteractionResponseUnion>;
	}

	interface MessageComponentInteraction {
		defaultFollowup(text: string, ephemeral?: boolean): Promise<InteractionResponseUnion>;
		successFollowup(text: string, ephemeral?: boolean): Promise<InteractionResponseUnion>;
		errorFollowup(text: string, ephemeral?: boolean): Promise<InteractionResponseUnion>;
	}

	interface ModalSubmitInteraction {
		defaultFollowup(text: string, ephemeral?: boolean): Promise<InteractionResponseUnion>;
		successFollowup(text: string, ephemeral?: boolean): Promise<InteractionResponseUnion>;
		errorFollowup(text: string, ephemeral?: boolean): Promise<InteractionResponseUnion>;
	}
}

declare module '@sapphire/pieces' {
	interface Container {
		config: Config;
		validator: Validator;
		metrics: Metrics;

		db: PrismaClient;
		redis: RedisClient;

		moderation: ModerationService;
		notifications: NotificationService;
		polls: PollService;
		utility: UtilityService;
		karaoke: KaraokeService;
		youtube: YoutubeService;
	}
}
