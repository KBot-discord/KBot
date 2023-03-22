import { EmbedColors } from '#utils/constants';
import { parseCustomId, PollCustomIds } from '#utils/customIds';
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { EmbedBuilder, type ButtonInteraction } from 'discord.js';
import { isNullish } from '@sapphire/utilities';
import type { PollOption } from '#types/CustomIds';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.Button
})
export class ButtonHandler extends InteractionHandler {
	private readonly customIds = [PollCustomIds.Vote];

	public override async run(interaction: ButtonInteraction<'cached'>, { option }: InteractionHandler.ParseResult<this>) {
		const { polls } = this.container.utility;

		try {
			const active = await polls.isActive({
				guildId: interaction.guildId,
				pollId: interaction.message.id
			});
			if (!active) {
				return interaction.defaultFollowup('That poll is not active.', true);
			}

			await polls.upsertVote({
				guildId: interaction.guildId,
				pollId: interaction.message.id,
				userId: interaction.user.id,
				option
			});

			return interaction.editReply({
				embeds: [
					new EmbedBuilder()
						.setColor(EmbedColors.Success)
						.setDescription(`You have voted for option ${option + 1}`)
						.setFooter({ text: 'Only the latest vote counts' })
				]
			});
		} catch (err) {
			this.container.logger.error(err);
			return interaction.errorReply('There was an error when trying to save your vote.');
		}
	}

	public override async parse(interaction: ButtonInteraction<'cached'>) {
		if (!this.customIds.some((id) => interaction.customId.startsWith(id))) return this.none();

		const settings = await this.container.utility.getSettings(interaction.guildId);
		if (isNullish(settings) || !settings.enabled) {
			await interaction.errorReply(`The module for this feature is disabled.\nYou can run \`/utility toggle\` to enable it.`);
			return this.none();
		}

		await interaction.deferReply({ ephemeral: true });

		const {
			data: { option }
		} = parseCustomId<PollOption>(interaction.customId);

		return this.some({ option });
	}
}
