import type { InteractionResponse, Message, MessageComponentInteraction } from 'discord.js';
import { CommandInteraction, EmbedBuilder, ModalSubmitInteraction } from 'discord.js';
import type { ReplyArgs } from '../types/Augments.js';
import { EmbedColors } from './constants.js';

type InteractionUnion = CommandInteraction | MessageComponentInteraction | ModalSubmitInteraction;

type FormattedResponse = {
	embeds: EmbedBuilder[];
	allowedMentions: {
		users: string[];
		roles: never[];
	};
	ephemeral: boolean | undefined;
};

function formatResponse(
	interaction: InteractionUnion,
	color: EmbedColors,
	text: string,
	tryEphemeral?: boolean,
): FormattedResponse {
	const embed = new EmbedBuilder().setColor(color).setDescription(text);
	const ephemeral = interaction.ephemeral ?? tryEphemeral;
	return {
		embeds: [embed],
		allowedMentions: { users: [interaction.user.id], roles: [] },
		ephemeral,
	};
}

async function _safeReply(
	interaction: InteractionUnion,
	color: EmbedColors,
	text: string,
	tryEphemeral?: boolean,
): Promise<InteractionResponse | Message> {
	const data = formatResponse(interaction, color, text, tryEphemeral);
	return interaction.deferred || interaction.replied //
		? await interaction.editReply(data)
		: await interaction.reply(data);
}

CommandInteraction.prototype.defaultReply = ModalSubmitInteraction.prototype.defaultReply = async function defaultReply(
	...[text, options]: ReplyArgs
): Promise<InteractionResponse | Message> {
	return await _safeReply(this, EmbedColors.Default, text, options?.tryEphemeral);
};

CommandInteraction.prototype.successReply = ModalSubmitInteraction.prototype.successReply = async function successReply(
	...[text, options]: ReplyArgs
): Promise<InteractionResponse | Message> {
	return await _safeReply(this, EmbedColors.Success, text, options?.tryEphemeral);
};

CommandInteraction.prototype.errorReply = ModalSubmitInteraction.prototype.errorReply = async function errorReply(
	...[text, options]: ReplyArgs
): Promise<InteractionResponse | Message> {
	return await _safeReply(this, EmbedColors.Error, text, options?.tryEphemeral);
};
