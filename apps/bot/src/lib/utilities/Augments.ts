import { EmbedColors } from '#utils/constants';
import { CommandInteraction, EmbedBuilder, MessageComponentInteraction, ModalSubmitInteraction } from 'discord.js';

type InteractionUnion = CommandInteraction | MessageComponentInteraction | ModalSubmitInteraction;

function formatResponse(interaction: InteractionUnion, color: EmbedColors, text: string, tryEphemeral?: boolean) {
	const embed = new EmbedBuilder().setColor(color).setDescription(text);
	const ephemeral = interaction.ephemeral ?? tryEphemeral;
	return {
		embeds: [embed],
		allowedMentions: { users: [interaction.user.id], roles: [] },
		ephemeral
	};
}

function _safeReply(interaction: InteractionUnion, color: EmbedColors, text: string, tryEphemeral?: boolean) {
	const data = formatResponse(interaction, color, text, tryEphemeral);
	return interaction.deferred || interaction.replied //
		? interaction.editReply(data)
		: interaction.reply(data);
}

function _safeFollowup(interaction: InteractionUnion, color: EmbedColors, text: string, tryEphemeral?: boolean) {
	const data = formatResponse(interaction, color, text, tryEphemeral);
	return interaction.followUp(data);
}

CommandInteraction.prototype.defaultReply =
	MessageComponentInteraction.prototype.defaultReply =
	ModalSubmitInteraction.prototype.defaultReply =
		function defaultReply(text: string, tryEphemeral?: boolean) {
			return _safeReply(this, EmbedColors.Default, text, tryEphemeral);
		};

CommandInteraction.prototype.successReply =
	MessageComponentInteraction.prototype.successReply =
	ModalSubmitInteraction.prototype.successReply =
		function successReply(text: string, tryEphemeral?: boolean) {
			return _safeReply(this, EmbedColors.Success, text, tryEphemeral);
		};

CommandInteraction.prototype.errorReply =
	MessageComponentInteraction.prototype.errorReply =
	ModalSubmitInteraction.prototype.errorReply =
		function errorReply(text: string, tryEphemeral?: boolean) {
			return _safeReply(this, EmbedColors.Error, text, tryEphemeral);
		};

CommandInteraction.prototype.defaultFollowup =
	MessageComponentInteraction.prototype.defaultFollowup =
	ModalSubmitInteraction.prototype.defaultFollowup =
		function defaultFollowup(text: string, ephemeral?: boolean) {
			return _safeFollowup(this, EmbedColors.Default, text, ephemeral);
		};

CommandInteraction.prototype.successFollowup =
	MessageComponentInteraction.prototype.successFollowup =
	ModalSubmitInteraction.prototype.successFollowup =
		function successFollowup(text: string, ephemeral?: boolean) {
			return _safeFollowup(this, EmbedColors.Success, text, ephemeral);
		};

CommandInteraction.prototype.errorFollowup =
	MessageComponentInteraction.prototype.errorFollowup =
	ModalSubmitInteraction.prototype.errorFollowup =
		function errorFollowup(text: string, ephemeral?: boolean) {
			return _safeFollowup(this, EmbedColors.Error, text, ephemeral);
		};
