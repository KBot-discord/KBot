import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { parseKey } from '../../../lib/util/keys';
import { PollCustomIds } from '../../../lib/types/enums';
import type { ButtonInteraction } from 'discord.js';
import type { IPollMenuCustomId, Key } from '../../../lib/types/keys';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.Button
})
export class ButtonHandler extends InteractionHandler {
	public override async run(interaction: ButtonInteraction, { pollId }: InteractionHandler.ParseResult<this>) {
		try {
			const success = await this.container.polls.endPoll(pollId);
			if (success) return interaction.successReply('Poll ended.');
			return interaction.defaultReply('Poll already ended.');
		} catch (err) {
			this.container.logger.error(err);
		}
	}

	public override async parse(interaction: ButtonInteraction) {
		if (!interaction.customId.startsWith(PollCustomIds.End)) return this.none();
		await interaction.deferReply({ ephemeral: true });

		const { pollId } = parseKey<IPollMenuCustomId>(interaction.customId as Key);

		return this.some({ pollId });
	}
}
