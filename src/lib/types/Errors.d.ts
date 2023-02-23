import type { KBotErrors } from '#types/Enums';
import type { KBotError } from '../structures/KBotError';
import type { CommandInteraction } from 'discord.js';

export interface ErrorPayload {
	error: KBotError;
}

export interface ChannelPermissionsPayload extends ErrorPayload {
	interaction: CommandInteraction;
}

export interface ModerationPermissionsPayload extends ErrorPayload {
	interaction: CommandInteraction;
}

export type Payload<T extends KBotErrors> = T extends KBotErrors.ChannelPermissions
	? ChannelPermissionsPayload
	: T extends KBotErrors.ModerationPermissions
	? ModerationPermissionsPayload
	: never;
