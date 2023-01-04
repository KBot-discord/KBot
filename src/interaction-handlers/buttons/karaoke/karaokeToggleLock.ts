import { KaraokeCustomIds } from '#utils/constants';
import { KaraokeEventMenu } from '#lib/structures/KaraokeEventMenu';
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { parseCustomId } from '@kbotdev/custom-id';
import type { KaraokeMenuButton } from '#lib/types/CustomIds';
import type { ButtonInteraction } from 'discord.js';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.Button
})
export class ButtonHandler extends InteractionHandler {
	private readonly customIds = [KaraokeCustomIds.Lock, KaraokeCustomIds.Unlock];

	public override async run(interaction: ButtonInteraction, { menu, eventId, shouldLock }: InteractionHandler.ParseResult<this>) {
		const { karaoke } = this.container;

		try {
			const event = await karaoke.repo.fetchEvent(eventId);
			if (!event) return interaction.errorFollowup('Something went wrong.', true);

			if (shouldLock && event.locked) return interaction.defaultFollowup('Queue is already locked.', true);
			if (!shouldLock && !event!.locked) return interaction.defaultFollowup('Queue is already unlocked.', true);

			const updatedEvent = await karaoke.repo.updateQueueLock(eventId, !event.locked);
			if (!updatedEvent) return interaction.errorFollowup('Something went wrong.', true);

			const updatedPage = KaraokeEventMenu.pageUpdateLock(menu, updatedEvent);
			return menu.updatePage(updatedPage);
		} catch (err) {
			this.container.logger.error(err);
			return interaction.errorFollowup('There was an error trying to lock the queue.', true);
		}
	}

	public override async parse(interaction: ButtonInteraction) {
		if (!this.customIds.some((id) => interaction.customId.startsWith(id))) return this.none();

		const menu = await KaraokeEventMenu.handlers.get(interaction.user.id);
		if (!menu) {
			await interaction.defaultReply('Please run `/event karaoke` again.', true);
			return this.none();
		}

		await interaction.deferUpdate();

		const {
			prefix,
			data: { eventId }
		} = parseCustomId<KaraokeMenuButton>(interaction.customId);

		const shouldLock = prefix === KaraokeCustomIds.Lock;

		return this.some({ menu, eventId, shouldLock });
	}
}
