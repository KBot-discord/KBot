import { BaseCommandInteraction, BaseGuildVoiceChannel, MessageComponentInteraction, MessageEmbed, ModalSubmitInteraction } from 'discord.js';
import { EmbedColors } from './constants';

BaseCommandInteraction.prototype.defaultReply =
	MessageComponentInteraction.prototype.defaultReply =
	ModalSubmitInteraction.prototype.defaultReply =
		function defaultReply(text: string) {
			const embed = new MessageEmbed().setColor(EmbedColors.Default).setDescription(text);
			const data = { embeds: [embed], allowedMentions: { users: [this.user.id], roles: [] } };
			return this.deferred || this.replied ? this.editReply(data) : this.reply(data);
		};

BaseCommandInteraction.prototype.successReply =
	MessageComponentInteraction.prototype.successReply =
	ModalSubmitInteraction.prototype.successReply =
		function successReply(text: string) {
			const embed = new MessageEmbed().setColor(EmbedColors.Success).setDescription(text);
			const data = { embeds: [embed], allowedMentions: { users: [this.user.id], roles: [] } };
			return this.deferred || this.replied ? this.editReply(data) : this.reply(data);
		};

BaseCommandInteraction.prototype.errorReply =
	MessageComponentInteraction.prototype.errorReply =
	ModalSubmitInteraction.prototype.errorReply =
		function errorReply(text: string) {
			const embed = new MessageEmbed().setColor(EmbedColors.Error).setDescription(text);
			const data = { embeds: [embed], allowedMentions: { users: [this.user.id], roles: [] } };
			return this.deferred || this.replied ? this.editReply(data) : this.reply(data);
		};

BaseGuildVoiceChannel.prototype.isStageChannel = function isStageChannel() {
	return this.type === 'GUILD_STAGE_VOICE';
};

BaseGuildVoiceChannel.prototype.isVoiceChannel = function isVoiceChannel() {
	return this.type === 'GUILD_VOICE';
};
