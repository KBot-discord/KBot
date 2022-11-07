// imports
import { Events, Listener, UserError, type ChatInputCommandDeniedPayload } from '@sapphire/framework';
import { MessageEmbed } from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';
import { embedColors } from '../../lib/util/constants';

@ApplyOptions<Listener.Options>({
	name: Events.ChatInputCommandDenied
})
export class CommandDeniedListener extends Listener {
	public run(error: UserError, payload: ChatInputCommandDeniedPayload) {
		return payload.interaction.reply({
			embeds: [new MessageEmbed().setColor(embedColors.error).setDescription(error.message)],
			allowedMentions: { users: [payload.interaction.user.id], roles: [] },
			ephemeral: true
		});
	}
}