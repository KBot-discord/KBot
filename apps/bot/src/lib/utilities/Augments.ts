import { EmbedColors } from '#utils/constants';
import { CommandInteraction, EmbedBuilder, MessageComponentInteraction, ModalSubmitInteraction } from 'discord.js';
import type { Message, InteractionResponse } from 'discord.js';

type InteractionUnion = CommandInteraction | MessageComponentInteraction | ModalSubmitInteraction;

type FormattedResponse = {
	embeds: EmbedBuilder[];
	allowedMentions: {
		users: string[];
		roles: never[];
	};
	ephemeral: boolean | undefined;
};

function formatResponse(interaction: InteractionUnion, color: EmbedColors, text: string, tryEphemeral?: boolean): FormattedResponse {
	const embed = new EmbedBuilder().setColor(color).setDescription(text);
	const ephemeral = interaction.ephemeral ?? tryEphemeral;
	return {
		embeds: [embed],
		allowedMentions: { users: [interaction.user.id], roles: [] },
		ephemeral
	};
}

async function _safeReply(
	interaction: InteractionUnion,
	color: EmbedColors,
	text: string,
	tryEphemeral?: boolean
): Promise<InteractionResponse | Message> {
	const data = formatResponse(interaction, color, text, tryEphemeral);
	return interaction.deferred || interaction.replied //
		? interaction.editReply(data)
		: interaction.reply(data);
}

async function _safeFollowup(interaction: InteractionUnion, color: EmbedColors, text: string, tryEphemeral?: boolean): Promise<Message> {
	const data = formatResponse(interaction, color, text, tryEphemeral);
	return interaction.followUp(data);
}

CommandInteraction.prototype.defaultReply =
	MessageComponentInteraction.prototype.defaultReply =
	ModalSubmitInteraction.prototype.defaultReply =
		async function defaultReply(text: string, tryEphemeral?: boolean): Promise<InteractionResponse | Message> {
			return _safeReply(this, EmbedColors.Default, text, tryEphemeral);
		};

CommandInteraction.prototype.successReply =
	MessageComponentInteraction.prototype.successReply =
	ModalSubmitInteraction.prototype.successReply =
		async function successReply(text: string, tryEphemeral?: boolean): Promise<InteractionResponse | Message> {
			return _safeReply(this, EmbedColors.Success, text, tryEphemeral);
		};

CommandInteraction.prototype.errorReply =
	MessageComponentInteraction.prototype.errorReply =
	ModalSubmitInteraction.prototype.errorReply =
		async function errorReply(text: string, tryEphemeral?: boolean): Promise<InteractionResponse | Message> {
			return _safeReply(this, EmbedColors.Error, text, tryEphemeral);
		};

CommandInteraction.prototype.defaultFollowup =
	MessageComponentInteraction.prototype.defaultFollowup =
	ModalSubmitInteraction.prototype.defaultFollowup =
		async function defaultFollowup(text: string, ephemeral?: boolean): Promise<InteractionResponse | Message> {
			return _safeFollowup(this, EmbedColors.Default, text, ephemeral);
		};

CommandInteraction.prototype.successFollowup =
	MessageComponentInteraction.prototype.successFollowup =
	ModalSubmitInteraction.prototype.successFollowup =
		async function successFollowup(text: string, ephemeral?: boolean): Promise<InteractionResponse | Message> {
			return _safeFollowup(this, EmbedColors.Success, text, ephemeral);
		};

CommandInteraction.prototype.errorFollowup =
	MessageComponentInteraction.prototype.errorFollowup =
	ModalSubmitInteraction.prototype.errorFollowup =
		async function errorFollowup(text: string, ephemeral?: boolean): Promise<InteractionResponse | Message> {
			return _safeFollowup(this, EmbedColors.Error, text, ephemeral);
		};
