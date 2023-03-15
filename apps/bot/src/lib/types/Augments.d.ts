import type { MeilisearchClient } from '#extensions/MeiliClient';
import type { GuildMember, User, CommandInteraction, Message, InteractionResponse } from 'discord.js';
import type { KBotError } from '#structures/KBotError';
import type { KBotEvents } from '#types/Events';
import type { KBotMetrics } from '#observability/KBotMetrics';
import type { APIMessage } from 'discord-api-types/v10';
import type { ClientConfig } from './Config';
import type { RedisClient } from '#extensions/RedisClient';
import type { ModerationSettings, PrismaClient } from '#prisma';
import type { Validator } from '#utils/validators';
import type { KBotErrors } from '#utils/constants';
import type { CoreModule } from '#modules/CoreModule';
import type { EventModule } from '#modules/EventModule';
import type { ModerationModule } from '#modules/ModerationModule';
import type { PremiumModule } from '#modules/PremiumModule';
import type { TwitchModule } from '#modules/TwitchModule';
import type { UtilityModule } from '#modules/UtilityModule';
import type { WelcomeModule } from '#modules/WelcomeModule';
import type { YoutubeModule } from '#modules/YoutubeModule';
import type { ModerationActionContext } from '#types/Moderation';

export type InteractionResponseUnion = void | APIMessage | Message<boolean> | InteractionResponse<boolean>;

declare module 'discord.js' {
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
		config: ClientConfig;
		validator: Validator;
		metrics: KBotMetrics;

		prisma: PrismaClient;
		redis: RedisClient;
		meili: MeilisearchClient;

		core: CoreModule;
		events: EventModule;
		moderation: ModerationModule;
		premium: PremiumModule;
		twitch: TwitchModule;
		utility: UtilityModule;
		welcome: WelcomeModule;
		youtube: YoutubeModule;
	}
}

declare module '@sapphire/framework' {
	interface SapphireClient {
		emit(event: KBotErrors, context: { error: KBotError; interaction: CommandInteraction }): boolean;
		emit(
			event: KBotEvents.ModerationLog,
			context: {
				target: GuildMember | User;
				moderator: GuildMember;
				settings: ModerationSettings;
				data: ModerationActionContext;
			}
		): boolean;
	}
}
