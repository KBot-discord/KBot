import { KBotErrors } from '../util/constants';
import type { KBotError } from '../structures/KBotError';
import type { BaseCommandInteraction } from 'discord.js';

export interface ErrorPayload {
	error: KBotError;
}

export interface ChannelPermissionsPayload extends ErrorPayload {
	interaction: BaseCommandInteraction;
}

export type Payload<T extends KBotErrors> = T extends KBotErrors.ChannelPermissions ? ChannelPermissionsPayload : never;
