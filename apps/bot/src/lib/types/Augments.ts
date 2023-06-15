import type { MeilisearchClient } from '@kbotdev/meili';
import type { APIMessage, InteractionResponse, Message } from 'discord.js';
import type { KBotMetrics } from '#observability/KBotMetrics';
import type { ClientConfig } from '#types/Config';
import type { RedisClient } from '@kbotdev/redis';
import type { PrismaClient } from '@kbotdev/database';
import type { Validator } from '#utils/validators';
import type { CoreModule } from '#modules/CoreModule';
import type { EventModule } from '#modules/EventModule';
import type { ModerationModule } from '#modules/ModerationModule';
import type { UtilityModule } from '#modules/UtilityModule';
import type { WelcomeModule } from '#modules/WelcomeModule';
import type { YoutubeModule } from '#modules/YouTubeModule';
import type { Holodex } from '@kbotdev/holodex';
import type { KBotErrors } from '#types/Enums';
import type { ChannelPermissionsPayload } from '#types/Errors';
import type { AuthData } from '@sapphire/plugin-api';
import type { WebhookErrorBuilder } from '#structures/builders/WebhookErrorBuilder';

export type InteractionResponseUnion = APIMessage | InteractionResponse | Message | void;

export type ReplyArgs = [text: string, options?: { tryEphemeral?: boolean }];

export type FollowupArgs = [text: string, options?: { ephemeral?: boolean }];

declare module 'discord.js' {
	interface Client {
		/**
		 * Send formatted errors to a channel in the developer server.
		 */
		readonly webhook: WebhookClient | null;
	}

	interface ClientEvents {
		[KBotErrors.WebhookError]: [error: unknown];
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

		/**
		 * Send a formatted error to a channel in the developer server.
		 * @param builder - The embed for the webhook
		 */
		webhookError(builder: (builder: WebhookErrorBuilder) => WebhookErrorBuilder): Promise<void>;
	}
}

declare module '@bufbuild/connect' {
	interface HandlerContext {
		/**
		 * Authentication data about the incoming Request.
		 */
		auth: AuthData;
	}
}
