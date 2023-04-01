import type { KBotErrors } from '#types/Enums';
import type { KBotError } from '#structures/KBotError';
import type { CommandInteraction } from 'discord.js';
import type { ModuleCommand } from '@kbotdev/plugin-modules';

export interface ErrorPayload {
	error: KBotError;
}

export interface ChannelPermissionsPayload extends ErrorPayload {
	interaction: CommandInteraction;
}

export interface UnknownCommandPayload extends ErrorPayload {
	interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>;
}

export type Payload<T extends KBotErrors> = T extends KBotErrors.ChannelPermissions
	? ChannelPermissionsPayload
	: T extends KBotErrors.UnknownCommand
	? UnknownCommandPayload
	: never;
