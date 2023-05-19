import type { MeilisearchClient } from '#extensions/MeiliClient';
import type { Message, InteractionResponse } from 'discord.js';
import type { KBotMetrics } from '#observability/KBotMetrics';
import type { APIMessage } from 'discord-api-types/v10';
import type { ClientConfig } from '#types/Config';
import type { RedisClient } from '@kbotdev/redis';
import type { PrismaClient } from '@kbotdev/prisma';
import type { Validator } from '#utils/validators';
import type { CoreModule } from '#modules/CoreModule';
import type { EventModule } from '#modules/EventModule';
import type { ModerationModule } from '#modules/ModerationModule';
import type { UtilityModule } from '#modules/UtilityModule';
import type { WelcomeModule } from '#modules/WelcomeModule';
import type { YoutubeModule } from '#modules/YoutubeModule';
import type { Holodex } from '@kbotdev/holodex';
import type { KBotErrors } from './Enums';
import type { ChannelPermissionsPayload, UnknownCommandPayload } from '#types/Errors';

export type InteractionResponseUnion = APIMessage | InteractionResponse | Message | void;

declare module 'discord.js' {
	interface ClientEvents {
		[KBotErrors.ChannelPermissions]: [payload: ChannelPermissionsPayload];
		[KBotErrors.UnknownCommand]: [payload: UnknownCommandPayload];
	}

	interface CommandInteraction {
		defaultReply(text: string, tryEphemeral?: boolean): Promise<InteractionResponseUnion>;
		successReply(text: string, tryEphemeral?: boolean): Promise<InteractionResponseUnion>;
		errorReply(text: string, tryEphemeral?: boolean): Promise<InteractionResponseUnion>;

		defaultFollowup(text: string, ephemeral?: boolean): Promise<InteractionResponseUnion>;
		successFollowup(text: string, ephemeral?: boolean): Promise<InteractionResponseUnion>;
		errorFollowup(text: string, ephemeral?: boolean): Promise<InteractionResponseUnion>;
	}

	interface MessageComponentInteraction {
		defaultReply(text: string, tryEphemeral?: boolean): Promise<InteractionResponseUnion>;
		successReply(text: string, tryEphemeral?: boolean): Promise<InteractionResponseUnion>;
		errorReply(text: string, tryEphemeral?: boolean): Promise<InteractionResponseUnion>;

		defaultFollowup(text: string, ephemeral?: boolean): Promise<InteractionResponseUnion>;
		successFollowup(text: string, ephemeral?: boolean): Promise<InteractionResponseUnion>;
		errorFollowup(text: string, ephemeral?: boolean): Promise<InteractionResponseUnion>;
	}

	interface ModalSubmitInteraction {
		defaultReply(text: string, tryEphemeral?: boolean): Promise<InteractionResponseUnion>;
		successReply(text: string, tryEphemeral?: boolean): Promise<InteractionResponseUnion>;
		errorReply(text: string, tryEphemeral?: boolean): Promise<InteractionResponseUnion>;

		defaultFollowup(text: string, ephemeral?: boolean): Promise<InteractionResponseUnion>;
		successFollowup(text: string, ephemeral?: boolean): Promise<InteractionResponseUnion>;
		errorFollowup(text: string, ephemeral?: boolean): Promise<InteractionResponseUnion>;
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
		sentryMessage(message: string, context?: NonNullable<unknown>): void;
		sentryError(error: Error, context?: NonNullable<unknown>): void;
	}
}
