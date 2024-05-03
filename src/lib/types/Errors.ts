import type { MessageComponentInteraction, ModalSubmitInteraction } from 'discord.js';
import type { KBotCommand } from '../extensions/KBotCommand.js';
import type { ChannelPermissionsError } from '../structures/errors/ChannelPermissionsError.js';

export type ChannelPermissionsPayload = {
	error: ChannelPermissionsError;
	interaction:
		| KBotCommand.ChatInputCommandInteraction //
		| KBotCommand.ContextMenuCommandInteraction
		| MessageComponentInteraction
		| ModalSubmitInteraction;
};
