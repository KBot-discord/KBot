import type { KBotError } from '#lib/structures/errors/KBotError';
import type { KBotCommand } from '#lib/extensions/KBotCommand';
import type { MessageComponentInteraction, ModalSubmitInteraction } from 'discord.js';
import type { ChannelPermissionsError } from '#lib/structures/errors/ChannelPermissionsError';

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
