import type { KBotError } from '../structures/KBotError';
import type { BaseCommandInteraction } from 'discord.js';

export const enum KBotErrors {
	ChannelPermissions = 'channelPermissions'
}

export interface ErrorPayload {
	error: KBotError;
}

export interface ChannelPermissionsPayload extends ErrorPayload {
	interaction: BaseCommandInteraction;
}

export type Payload<T extends KBotErrors> = T extends KBotErrors.ChannelPermissions ? ChannelPermissionsPayload : never;
