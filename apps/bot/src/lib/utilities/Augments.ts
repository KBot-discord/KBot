import { EmbedColors } from '#lib/utilities/constants';
import { CommandInteraction, EmbedBuilder, MessageComponentInteraction, ModalSubmitInteraction } from 'discord.js';
import type { FollowupArgs, ReplyArgs } from '#lib/types/Augments';
import type { InteractionResponse, Message } from 'discord.js';

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
		? await interaction.editReply(data)
		: await interaction.reply(data);
}

async function _safeFollowup(interaction: InteractionUnion, color: EmbedColors, text: string, tryEphemeral?: boolean): Promise<Message> {
	const data = formatResponse(interaction, color, text, tryEphemeral);
	return await interaction.followUp(data);
}

CommandInteraction.prototype.defaultReply =
	MessageComponentInteraction.prototype.defaultReply =
	ModalSubmitInteraction.prototype.defaultReply =
		async function defaultReply(...[text, options]: ReplyArgs): Promise<InteractionResponse | Message> {
			return await _safeReply(this, EmbedColors.Default, text, options?.tryEphemeral);
		};

CommandInteraction.prototype.successReply =
	MessageComponentInteraction.prototype.successReply =
	ModalSubmitInteraction.prototype.successReply =
		async function successReply(...[text, options]: ReplyArgs): Promise<InteractionResponse | Message> {
			return await _safeReply(this, EmbedColors.Success, text, options?.tryEphemeral);
		};

CommandInteraction.prototype.errorReply =
	MessageComponentInteraction.prototype.errorReply =
	ModalSubmitInteraction.prototype.errorReply =
		async function errorReply(...[text, options]: ReplyArgs): Promise<InteractionResponse | Message> {
			return await _safeReply(this, EmbedColors.Error, text, options?.tryEphemeral);
		};

CommandInteraction.prototype.defaultFollowup =
	MessageComponentInteraction.prototype.defaultFollowup =
	ModalSubmitInteraction.prototype.defaultFollowup =
		async function defaultFollowup(...[text, options]: FollowupArgs): Promise<InteractionResponse | Message> {
			return await _safeFollowup(this, EmbedColors.Default, text, options?.ephemeral);
		};

CommandInteraction.prototype.successFollowup =
	MessageComponentInteraction.prototype.successFollowup =
	ModalSubmitInteraction.prototype.successFollowup =
		async function successFollowup(...[text, options]: FollowupArgs): Promise<InteractionResponse | Message> {
			return await _safeFollowup(this, EmbedColors.Success, text, options?.ephemeral);
		};

CommandInteraction.prototype.errorFollowup =
	MessageComponentInteraction.prototype.errorFollowup =
	ModalSubmitInteraction.prototype.errorFollowup =
		async function errorFollowup(...[text, options]: FollowupArgs): Promise<InteractionResponse | Message> {
			return await _safeFollowup(this, EmbedColors.Error, text, options?.ephemeral);
		};
