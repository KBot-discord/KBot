// Imports
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { MessageEmbed, type ButtonInteraction } from 'discord.js';
import { embedColors } from '../../lib/util/constants';
import type { IPollCustomId, Key } from '../../lib/types/keys';
import { parseKey } from '../../lib/util/keys';
import { PollCustomId } from '../../lib/types/enums';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.Button
})
export class ButtonHandler extends InteractionHandler {
	public override async run(interaction: ButtonInteraction, result: InteractionHandler.ParseResult<this>) {
		return interaction.editReply({
			embeds: [
				new MessageEmbed()
					.setColor(embedColors.success)
					.setDescription(`Vote added to option ${result.selectedOption + 1}\n(only the latest vote counts)`)
			]
		});
	}

	public override async parse(interaction: ButtonInteraction) {
		if (!interaction.customId.startsWith(PollCustomId)) return this.none();
		await interaction.deferReply({ ephemeral: true });

		const { option } = parseKey<IPollCustomId>(interaction.customId as Key);
		await this.container.polls.updatePollUser(interaction.user.id, interaction.message.id, option);

		return this.some({ messageId: interaction.message.id, selectedOption: option });
	}
}
