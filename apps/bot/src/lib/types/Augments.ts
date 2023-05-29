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
import type { ChannelPermissionsPayload, UnknownCommandPayload } from '#types/Errors';
import type { AuthData } from '@sapphire/plugin-api';
import type { WebhookErrorBuilder } from '#structures/builders/WebhookErrorBuilder';

export type InteractionResponseUnion = APIMessage | InteractionResponse | Message | void;

export type ReplyArgs = [text: string, options?: { tryEphemeral?: boolean }];

export type FollowupArgs = [text: string, options?: { ephemeral?: boolean }];

declare module 'discord.js' {
	interface Client {
		readonly webhook: WebhookClient | null;
	}

	interface ClientEvents {
		[KBotErrors.WebhookError]: [error: unknown];
		[KBotErrors.ChannelPermissions]: [payload: ChannelPermissionsPayload];
		[KBotErrors.MissingSubcommandHandler]: [payload: UnknownCommandPayload];
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
		config: ClientConfig;
		validator: Validator;
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
		infoTag(tag: string, value: string): void;
		sentryMessage(message: string, data?: { context?: NonNullable<unknown> }): void;
		sentryError(error: unknown, data?: { message?: string; context?: NonNullable<unknown> }): void;
		webhookError(builder: (builder: WebhookErrorBuilder) => WebhookErrorBuilder): Promise<void>;
	}
}

declare module '@bufbuild/connect' {
	interface HandlerContext {
		auth: AuthData;
	}
}
