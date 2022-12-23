import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandlerTypes } from '@sapphire/framework';
import type { ButtonInteraction } from 'discord.js';
import { KaraokeCustomIds } from '../../../lib/util/constants';
import { DeferOptions, MenuInteractionHandler } from '@kbotdev/menus';
import type { KaraokeMenuButton } from '../../../lib/types/CustomIds';

@ApplyOptions<MenuInteractionHandler.Options>({
	customIdPrefix: [KaraokeCustomIds.Lock],
	defer: DeferOptions.Reply,
	ephemeral: true,
	interactionHandlerType: InteractionHandlerTypes.Button
})
export class ButtonHandler extends MenuInteractionHandler {
	public override async run(interaction: ButtonInteraction, { data: { eventId } }: MenuInteractionHandler.Result<KaraokeMenuButton>) {
		const { karaoke } = this.container;

		try {
			const event = await karaoke.repo.fetchEvent(eventId);
			if (event!.locked) return interaction.followUp('Queue is already locked.');

			await karaoke.repo.updateQueueLock(eventId, true);
			return interaction.followUp('Queue locked.');
		} catch (err) {
			this.container.logger.error(err);
			return interaction.errorReply('There was an error trying to lock the queue.');
		}
	}
}
