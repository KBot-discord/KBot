import type { CommandInteraction } from 'discord.js';
import type { ModuleCommand } from '@kbotdev/plugin-modules';
import type { KBotErrors } from '#types/Enums';
import type { KBotError } from '#structures/KBotError';

export type ErrorPayload = {
	error: KBotError;
};

export type ChannelPermissionsPayload = ErrorPayload & {
	interaction: CommandInteraction;
};

export type UnknownCommandPayload = ErrorPayload & {
	interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>;
};

export type Payload<T extends KBotErrors> = T extends KBotErrors.ChannelPermissions
	? ChannelPermissionsPayload
	: T extends KBotErrors.UnknownCommand
	? UnknownCommandPayload
	: never;
