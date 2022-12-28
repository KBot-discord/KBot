import { KaraokeCustomIds } from '#utils/constants';
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandlerTypes } from '@sapphire/framework';
import { DeferOptions, MenuInteractionHandler } from '@kbotdev/menus';
import type { ButtonInteraction } from 'discord.js';
import type { KaraokeMenuButton } from '#lib/types/CustomIds';

@ApplyOptions<MenuInteractionHandler.Options>({
	customIdPrefix: [KaraokeCustomIds.Stop],
	defer: DeferOptions.Reply,
	ephemeral: true,
	interactionHandlerType: InteractionHandlerTypes.Button
})
export class ButtonHandler extends MenuInteractionHandler {
	public override async run(interaction: ButtonInteraction, { data: { eventId } }: MenuInteractionHandler.Result<KaraokeMenuButton>) {
		const { karaoke } = this.container;

		try {
			const event = await karaoke.repo.fetchEvent(eventId);
			if (!event!.locked) return interaction.followUp('Queue is already unlocked.');

			await karaoke.repo.updateQueueLock(eventId, false);
			return interaction.followUp('Queue unlocked.');
		} catch (err) {
			this.container.logger.error(err);
			return interaction.errorReply('There was an error trying to lock the queue.');
		}
	}
}
