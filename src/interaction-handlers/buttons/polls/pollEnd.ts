import { PollCustomIds } from '#utils/constants';
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandlerTypes } from '@sapphire/framework';
import { DeferOptions, MenuInteractionHandler } from '@kbotdev/menus';
import type { ButtonInteraction } from 'discord.js';
import type { PollMenuButton } from '#lib/types/CustomIds';

@ApplyOptions<MenuInteractionHandler.Options>({
	customIdPrefix: [PollCustomIds.End],
	defer: DeferOptions.Reply,
	ephemeral: true,
	interactionHandlerType: InteractionHandlerTypes.Button
})
export class ButtonHandler extends MenuInteractionHandler {
	public override async run(interaction: ButtonInteraction, { data: { pollId } }: MenuInteractionHandler.Result<PollMenuButton>) {
		try {
			const success = await this.container.polls.endPoll(pollId);
			if (success) return interaction.successReply('Poll ended.');
			return interaction.defaultReply('Poll already ended.');
		} catch (err) {
			this.container.logger.error(err);
		}
	}
}
