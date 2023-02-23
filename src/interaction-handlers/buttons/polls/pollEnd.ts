import { PollCustomIds } from '#utils/constants';
import { parseCustomId } from '#utils/customIds';
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import type { ButtonInteraction } from 'discord.js';
import type { PollMenuButton } from '#types/CustomIds';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.Button
})
export class ButtonHandler extends InteractionHandler {
	private readonly customIds = [PollCustomIds.End];

	public override async run(interaction: ButtonInteraction, { pollId }: InteractionHandler.ParseResult<this>) {
		const { polls } = this.container.utility;

		try {
			const success = await polls.end(pollId);
			if (success) {
				return interaction.successReply('Poll has ended.');
			}

			return interaction.defaultReply('Poll has already ended.');
		} catch (err) {
			this.container.logger.error(err);
			return interaction.errorReply('There was an error when trying to end the poll.');
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
			data: { pollId }
		} = parseCustomId<PollMenuButton>(interaction.customId);

		return this.some({ pollId });
	}
}
