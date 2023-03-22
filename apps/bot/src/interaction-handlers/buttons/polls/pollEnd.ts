import { parseCustomId, PollCustomIds } from '#utils/customIds';
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import type { PollMenuButton } from '#types/CustomIds';
import type { ButtonInteraction } from 'discord.js';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.Button
})
export class ButtonHandler extends InteractionHandler {
	private readonly customIds = [PollCustomIds.End];

	public override async run(interaction: ButtonInteraction<'cached'>, { pollId }: InteractionHandler.ParseResult<this>) {
		try {
			const success = await this.container.utility.polls.end({
				guildId: interaction.guildId,
				pollId
			});

			if (success) {
				this.container.utility.polls.deleteTask(pollId);
				return interaction.successReply('Poll ended.');
			}

			return interaction.defaultReply('Poll already ended.');
		} catch (err) {
			this.container.logger.error(err);
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
