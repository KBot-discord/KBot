// Imports
import { BaseCommandInteraction, MessageEmbed } from 'discord.js';
import { embedColors } from './constants';

BaseCommandInteraction.prototype.defaultReply = function defaultReply(text: string) {
	const embed = new MessageEmbed().setColor(embedColors.default).setDescription(text);
	const data = { embeds: [embed], allowedMentions: { users: [this.user.id], roles: [] } };
	return this.deferred || this.replied ? this.editReply(data) : this.reply(data);
};

BaseCommandInteraction.prototype.successReply = function successReply(text: string) {
	const embed = new MessageEmbed().setColor(embedColors.success).setDescription(text);
	const data = { embeds: [embed], allowedMentions: { users: [this.user.id], roles: [] } };
	return this.deferred || this.replied ? this.editReply(data) : this.reply(data);
};

BaseCommandInteraction.prototype.errorReply = function errorReply(text: string) {
	const embed = new MessageEmbed().setColor(embedColors.error).setDescription(text);
	const data = { embeds: [embed], allowedMentions: { users: [this.user.id], roles: [] } };
	return this.deferred || this.replied ? this.editReply(data) : this.reply(data);
};
