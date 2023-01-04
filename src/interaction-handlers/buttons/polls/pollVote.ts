import { EmbedColors, PollCustomIds } from '#utils/constants';
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { MessageEmbed, type ButtonInteraction } from 'discord.js';
import { parseCustomId } from '@kbotdev/custom-id';
import type { PollOption } from '#lib/types/CustomIds';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.Button
})
export class ButtonHandler extends InteractionHandler {
	private readonly customIds = [PollCustomIds.Vote];

	public override async run(interaction: ButtonInteraction, { option }: InteractionHandler.ParseResult<this>) {
		try {
			await this.container.polls.repo.updatePollUser(interaction.user.id, interaction.message.id, option);
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

	public override async parse(interaction: ButtonInteraction) {
		if (!this.customIds.some((id) => interaction.customId.startsWith(id))) return this.none();

		const {
			data: { option }
		} = parseCustomId<PollOption>(interaction.customId);

		return this.some({ option });
	}
}
