import { PollCustomIds } from '#utils/customIds';
import { validCustomId } from '#utils/decorators';
import { isNullOrUndefined, parseCustomId } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { ButtonInteraction } from 'discord.js';
import type { PollMenuButton } from '#types/CustomIds';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.Button
})
export class ButtonHandler extends InteractionHandler {
	public override async run(interaction: ButtonInteraction<'cached'>, { pollId }: InteractionHandler.ParseResult<this>): Promise<void> {
		const {
			utility: { polls }
		} = this.container;

		const active = await polls.isActive(interaction.guildId, pollId);
		if (!active) {
			return void interaction.defaultReply('That poll is not active. Run `/poll menu` to see the updated menu.');
		}

		const success = await polls.end(interaction.guildId, pollId);

		if (success) {
			polls.deleteTask(pollId);
			return void interaction.successReply('Poll ended.');
		}

		await interaction.defaultReply('Poll already ended.');
	}

	@validCustomId(PollCustomIds.End)
	public override async parse(interaction: ButtonInteraction<'cached'>) {
		const settings = await this.container.utility.settings.get(interaction.guildId);
		if (isNullOrUndefined(settings) || !settings.enabled) {
			await interaction.errorReply(`The module for this feature is disabled.\nYou can run \`/utility toggle\` to enable it.`, {
				tryEphemeral: true
			});
			return this.none();
		}

		await interaction.deferReply({ ephemeral: true });

		const {
			data: { pollId }
		} = parseCustomId<PollMenuButton>(interaction.customId);

		return this.some({ pollId });
	}
}
