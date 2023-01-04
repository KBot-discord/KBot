import { EmbedColors, KBotErrors } from './constants';
import { Client, BaseCommandInteraction, BaseGuildVoiceChannel, MessageComponentInteraction, MessageEmbed, ModalSubmitInteraction } from 'discord.js';
import type { Payload } from '../types/Errors';

type InteractionUnion = BaseCommandInteraction | MessageComponentInteraction | ModalSubmitInteraction;

function formatResponse(interaction: InteractionUnion, color: EmbedColors, text: string, tryEphemeral?: boolean) {
	const embed = new MessageEmbed().setColor(color).setDescription(text);
	const ephemeral = interaction.ephemeral ?? tryEphemeral;
	return { embeds: [embed], allowedMentions: { users: [interaction.user.id], roles: [] }, ephemeral };
}

function _safeReply(interaction: InteractionUnion, color: EmbedColors, text: string, tryEphemeral?: boolean) {
	const data = formatResponse(interaction, color, text, tryEphemeral);
	return interaction.deferred || interaction.replied ? interaction.editReply(data) : interaction.reply(data);
}

function _safeFollowup(interaction: InteractionUnion, color: EmbedColors, text: string, tryEphemeral?: boolean) {
	const data = formatResponse(interaction, color, text, tryEphemeral);
	return interaction.followUp(data);
}

Client.prototype.emitError = function emitError(event: KBotErrors, payload: Payload<typeof event>) {
	return this.emit(event, payload);
};

BaseCommandInteraction.prototype.defaultReply =
	MessageComponentInteraction.prototype.defaultReply =
	ModalSubmitInteraction.prototype.defaultReply =
		function defaultReply(text: string, tryEphemeral?: boolean) {
			return _safeReply(this, EmbedColors.Default, text, tryEphemeral);
		};

BaseCommandInteraction.prototype.successReply =
	MessageComponentInteraction.prototype.successReply =
	ModalSubmitInteraction.prototype.successReply =
		function successReply(text: string, tryEphemeral?: boolean) {
			return _safeReply(this, EmbedColors.Success, text, tryEphemeral);
		};

BaseCommandInteraction.prototype.errorReply =
	MessageComponentInteraction.prototype.errorReply =
	ModalSubmitInteraction.prototype.errorReply =
		function errorReply(text: string, tryEphemeral?: boolean) {
			return _safeReply(this, EmbedColors.Error, text, tryEphemeral);
		};

BaseCommandInteraction.prototype.defaultFollowup =
	MessageComponentInteraction.prototype.defaultFollowup =
	ModalSubmitInteraction.prototype.defaultFollowup =
		function defaultFollowup(text: string, ephemeral?: boolean) {
			return _safeFollowup(this, EmbedColors.Default, text, ephemeral);
		};

BaseCommandInteraction.prototype.successFollowup =
	MessageComponentInteraction.prototype.successFollowup =
	ModalSubmitInteraction.prototype.successFollowup =
		function successFollowup(text: string, ephemeral?: boolean) {
			return _safeFollowup(this, EmbedColors.Success, text, ephemeral);
		};

BaseCommandInteraction.prototype.errorFollowup =
	MessageComponentInteraction.prototype.errorFollowup =
	ModalSubmitInteraction.prototype.errorFollowup =
		function errorFollowup(text: string, ephemeral?: boolean) {
			return _safeFollowup(this, EmbedColors.Error, text, ephemeral);
		};

BaseGuildVoiceChannel.prototype.isStageChannel = function isStageChannel() {
	return this.type === 'GUILD_STAGE_VOICE';
};

BaseGuildVoiceChannel.prototype.isVoiceChannel = function isVoiceChannel() {
	return this.type === 'GUILD_VOICE';
};
