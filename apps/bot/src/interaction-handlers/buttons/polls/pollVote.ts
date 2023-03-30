import { EmbedColors } from '#utils/constants';
import { parseCustomId, PollCustomIds } from '#utils/customIds';
import { validCustomId } from '#utils/decorators';
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { EmbedBuilder, type ButtonInteraction } from 'discord.js';
import { isNullish } from '@sapphire/utilities';
import type { PollOption } from '#types/CustomIds';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.Button
})
export class ButtonHandler extends InteractionHandler {
	public override async run(interaction: ButtonInteraction<'cached'>, { option }: InteractionHandler.ParseResult<this>) {
		const { polls } = this.container.utility;

		try {
			const active = await polls.isActive({
				guildId: interaction.guildId,
				pollId: interaction.message.id
			});
			if (!active) {
				return interaction.defaultReply('That poll is not active.');
			}

			await polls.upsertVote({
				guildId: interaction.guildId,
				pollId: interaction.message.id,
				userId: interaction.user.id,
				option: Number(option)
			});

			return interaction.editReply({
				embeds: [
					new EmbedBuilder()
						.setColor(EmbedColors.Success)
						.setDescription(`You have voted for option ${Number(option) + 1}`)
						.setFooter({ text: 'Only the latest vote counts' })
				]
			});
		} catch (err) {
			this.container.logger.error(err);
			return interaction.errorReply('There was an error when trying to save your vote.');
		}
	}

	@validCustomId(PollCustomIds.Vote)
	public override async parse(interaction: ButtonInteraction<'cached'>) {
		const settings = await this.container.utility.getSettings(interaction.guildId);
		if (isNullish(settings) || !settings.enabled) {
			await interaction.errorReply(`The module for this feature is disabled.\nYou can run \`/utility toggle\` to enable it.`, true);
			return this.none();
		}

		await interaction.deferReply({ ephemeral: true });

		const {
			data: { option }
		} = parseCustomId<PollOption>(interaction.customId);

		return this.some({ option });
	}
}
