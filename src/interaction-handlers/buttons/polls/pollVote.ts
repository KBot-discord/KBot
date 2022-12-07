import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { MessageEmbed, type ButtonInteraction } from 'discord.js';
import { EmbedColors } from '../../../lib/util/constants';
import { parseKey } from '../../../lib/util/keys';
import { PollCustomIds } from '../../../lib/types/enums';
import type { IPoll, Key } from '../../../lib/types/keys';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.Button
})
export class ButtonHandler extends InteractionHandler {
	public override async run(interaction: ButtonInteraction, { selectedOption }: InteractionHandler.ParseResult<this>) {
		try {
			await this.container.polls.db.updatePollUser(interaction.user.id, interaction.message.id, selectedOption);
			return interaction.editReply({
				embeds: [
					new MessageEmbed()
						.setColor(EmbedColors.Success)
						.setDescription(`Vote added to option ${selectedOption + 1}\n(only the latest vote counts)`)
				]
			});
		} catch (err) {
			this.container.logger.error(err);
			return interaction.editReply({
				embeds: [new MessageEmbed().setColor(EmbedColors.Error).setDescription('Something went wrong')]
			});
		}
	}

	public override async parse(interaction: ButtonInteraction) {
		if (!interaction.customId.startsWith(PollCustomIds.Vote)) return this.none();
		await interaction.deferReply({ ephemeral: true });

		const { option } = parseKey<IPoll>(interaction.customId as Key);

		return this.some({ selectedOption: option });
	}
}
