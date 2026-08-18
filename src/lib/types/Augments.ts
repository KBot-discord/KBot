import type { RedisClient } from '@killbasa/redis-utils';
import type { APIMessage, InteractionResponse, Message } from 'discord.js';
import type { PrismaClient } from '../../db/client.js';
import type { CoreModule } from '../../modules/CoreModule.js';
import type { ModerationModule } from '../../modules/ModerationModule.js';
import type { UtilityModule } from '../../modules/UtilityModule.js';
import type { KBotMetrics } from '../observability/KBotMetrics.js';
import type { Validator } from '../structures/Validator.js';
import type { ClientConfig } from './Config.js';

export type InteractionResponseUnion = APIMessage | InteractionResponse | Message | void;

export type ReplyArgs = [text: string, options?: { tryEphemeral?: boolean }];

export type FollowupArgs = [text: string, options?: { ephemeral?: boolean }];

declare module 'discord.js' {
	interface CommandInteraction {
		defaultReply(...args: ReplyArgs): Promise<InteractionResponseUnion>;
		successReply(...args: ReplyArgs): Promise<InteractionResponseUnion>;
		errorReply(...args: ReplyArgs): Promise<InteractionResponseUnion>;

		defaultFollowup(...args: FollowupArgs): Promise<InteractionResponseUnion>;
		successFollowup(...args: FollowupArgs): Promise<InteractionResponseUnion>;
		errorFollowup(...args: FollowupArgs): Promise<InteractionResponseUnion>;
	}

	interface MessageComponentInteraction {
		defaultReply(...args: ReplyArgs): Promise<InteractionResponseUnion>;
		successReply(...args: ReplyArgs): Promise<InteractionResponseUnion>;
		errorReply(...args: ReplyArgs): Promise<InteractionResponseUnion>;

		defaultFollowup(...args: FollowupArgs): Promise<InteractionResponseUnion>;
		successFollowup(...args: FollowupArgs): Promise<InteractionResponseUnion>;
		errorFollowup(...args: FollowupArgs): Promise<InteractionResponseUnion>;
	}

	interface ModalSubmitInteraction {
		defaultReply(...args: ReplyArgs): Promise<InteractionResponseUnion>;
		successReply(...args: ReplyArgs): Promise<InteractionResponseUnion>;
		errorReply(...args: ReplyArgs): Promise<InteractionResponseUnion>;

		defaultFollowup(...args: FollowupArgs): Promise<InteractionResponseUnion>;
		successFollowup(...args: FollowupArgs): Promise<InteractionResponseUnion>;
		errorFollowup(...args: FollowupArgs): Promise<InteractionResponseUnion>;
	}
}

declare module '@sapphire/pieces' {
	interface Container {
		/**
		 * Configurations values for the bot.
		 */
		config: ClientConfig;

		/**
		 * Validators to ensure the bot runs with the proper permissions and settings.
		 */
		validator: Validator;

		/**
		 * Metrics about the bot to send to send to Prometheus.
		 */
		metrics: KBotMetrics;

		prisma: PrismaClient;
		redis: RedisClient;

		core: CoreModule;
		utility: UtilityModule;
		moderation: ModerationModule;
	}
}

declare module '@sapphire/framework' {
	interface ILogger {
		/**
		 * Print a value along with it's tag.
		 * @param tag - The relevant domain of the value
		 * @param value - The value to print
		 */
		infoTag(tag: string, value: unknown): void;
	}
}
