import { parseCustomId, PollCustomIds } from '#utils/customIds';
import { validCustomId } from '#utils/decorators';
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import { ButtonInteraction } from 'discord.js';
import type { PollMenuButton } from '#types/CustomIds';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.Button
})
export class ButtonHandler extends InteractionHandler {
	public override async run(interaction: ButtonInteraction<'cached'>, { pollId }: InteractionHandler.ParseResult<this>) {
		const {
			utility: { polls }
		} = this.container;

		try {
			const active = await polls.isActive({
				guildId: interaction.guildId,
				pollId
			});
			if (!active) {
				return interaction.defaultReply('That poll is not active. Run `/poll menu` to see the updated menu.');
			}

			const success = await polls.end({
				guildId: interaction.guildId,
				pollId
			});

			if (success) {
				polls.deleteTask(pollId);
				return interaction.successReply('Poll ended.');
			}

			return interaction.defaultReply('Poll already ended.');
		} catch (err) {
			this.container.logger.error(err);
		}
	}

	@validCustomId(PollCustomIds.End)
	public override async parse(interaction: ButtonInteraction<'cached'>) {
		const settings = await this.container.utility.getSettings(interaction.guildId);
		if (isNullish(settings) || !settings.enabled) {
			await interaction.errorReply(`The module for this feature is disabled.\nYou can run \`/utility toggle\` to enable it.`, true);
			return this.none();
		}

		await interaction.deferReply({ ephemeral: true });

		const {
			data: { pollId }
		} = parseCustomId<PollMenuButton>(interaction.customId);

		return this.some({ pollId });
	}
}
