import type { KBotError } from '#structures/errors/KBotError';
import type { KBotCommand } from '#extensions/KBotCommand';
import type { MessageComponentInteraction, ModalSubmitInteraction } from 'discord.js';
import type { ChannelPermissionsError } from '#structures/errors/ChannelPermissionsError';

export type ErrorPayload = {
	error: KBotError;
};

export type ChannelPermissionsPayload = {
	error: ChannelPermissionsError;
	interaction:
		| KBotCommand.ChatInputCommandInteraction //
		| KBotCommand.ContextMenuCommandInteraction
		| MessageComponentInteraction
		| ModalSubmitInteraction;
};
