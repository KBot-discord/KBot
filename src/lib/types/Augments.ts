import type { RedisClient } from '@killbasa/redis-utils';
import type { PrismaClient } from '@prisma/client';
import type { APIMessage, InteractionResponse, Message } from 'discord.js';
import type { CoreModule } from '../../modules/CoreModule.js';
import type { EventModule } from '../../modules/EventModule.js';
import type { ModerationModule } from '../../modules/ModerationModule.js';
import type { UtilityModule } from '../../modules/UtilityModule.js';
import type { WelcomeModule } from '../../modules/WelcomeModule.js';
import type { YoutubeModule } from '../../modules/YouTubeModule.js';
import type { Holodex } from '../holodex/structures/Holodex.js';
import type { MeilisearchClient } from '../meili/structures/MeiliClient.js';
import type { KBotMetrics } from '../observability/KBotMetrics.js';
import type { Validator } from '../structures/Validator.js';
import type { ClientConfig } from './Config.js';
import { KBotErrors } from './Enums.js';
import type { ChannelPermissionsPayload } from './Errors.js';

export type InteractionResponseUnion = APIMessage | InteractionResponse | Message | void;

export type ReplyArgs = [text: string, options?: { tryEphemeral?: boolean }];

export type FollowupArgs = [text: string, options?: { ephemeral?: boolean }];

declare module 'discord.js' {
	interface ClientEvents {
		[KBotErrors.ChannelPermissions]: [payload: ChannelPermissionsPayload];
	}

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
		meili: MeilisearchClient;
		holodex: Holodex;

		core: CoreModule;
		events: EventModule;
		moderation: ModerationModule;
		utility: UtilityModule;
		welcome: WelcomeModule;
		youtube: YoutubeModule;
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

		/**
		 * Send a message to Sentry
		 * @param message - The message to send
		 * @param data - The data to send
		 */
		sentryMessage(message: string, data?: { context?: NonNullable<unknown> }): void;

		/**
		 * Send an error to Sentry
		 * @param error - The error to send
		 * @param data - The data to send
		 */
		sentryError(error: unknown, data?: { message?: string; context?: NonNullable<unknown> }): void;
	}
}
