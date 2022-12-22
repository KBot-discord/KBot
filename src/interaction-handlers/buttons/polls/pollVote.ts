import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandlerTypes } from '@sapphire/framework';
import { MessageEmbed, type ButtonInteraction } from 'discord.js';
import { EmbedColors } from '../../../lib/util/constants';
import { PollCustomIds } from '../../../lib/types/CustomIds';
import { DeferOptions, MenuInteractionHandler } from '@kbotdev/menus';
import type { PollOption } from '../../../lib/types/CustomIds';

@ApplyOptions<MenuInteractionHandler.Options>({
	customIdPrefix: [PollCustomIds.Vote],
	defer: DeferOptions.Reply,
	ephemeral: true,
	interactionHandlerType: InteractionHandlerTypes.Button
})
export class ButtonHandler extends MenuInteractionHandler {
	public override async run(interaction: ButtonInteraction, { data: { option } }: MenuInteractionHandler.Result<PollOption>) {
		try {
			await this.container.polls.db.updatePollUser(interaction.user.id, interaction.message.id, option);
			return interaction.editReply({
				embeds: [
					new MessageEmbed()
						.setColor(EmbedColors.Success)
						.setDescription(`Vote added to option ${option + 1}\n(only the latest vote counts)`)
				]
			});
		} catch (err) {
			this.container.logger.error(err);
			return interaction.editReply({
				embeds: [new MessageEmbed().setColor(EmbedColors.Error).setDescription('Something went wrong')]
			});
		}
	}
}
