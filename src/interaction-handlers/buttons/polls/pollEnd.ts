import { PollCustomIds } from '#utils/constants';
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { parseCustomId } from '@kbotdev/custom-id';
import type { ButtonInteraction } from 'discord.js';
import type { PollMenuButton } from '#lib/types/CustomIds';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.Button
})
export class ButtonHandler extends InteractionHandler {
	private readonly customIds = [PollCustomIds.End];

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
		if (!this.customIds.some((id) => interaction.customId.startsWith(id))) return this.none();

		const {
			data: { pollId }
		} = parseCustomId<PollMenuButton>(interaction.customId);

		return this.some({ pollId });
	}
}
