import { KaraokeCustomIds } from '#utils/constants';
import { KaraokeEventMenu } from '#structures/menus/KaraokeEventMenu';
import { parseCustomId } from '#utils/customIds';
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import type { KaraokeMenuButton } from '#types/CustomIds';
import type { ButtonInteraction } from 'discord.js';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.Button
})
export class ButtonHandler extends InteractionHandler {
	private readonly customIds = [KaraokeCustomIds.Lock, KaraokeCustomIds.Unlock];

	public override async run(interaction: ButtonInteraction<'cached'>, { menu, eventId, shouldLock }: InteractionHandler.ParseResult<this>) {
		const { karaoke } = this.container.events;

		try {
			const exists = await karaoke.eventExists({
				guildId: interaction.guildId,
				eventId
			});
			if (!exists) {
				return interaction.defaultFollowup(
					'There is no event to change the lock for. Run `/manage karaoke menu` to see the updated menu.',
					true
				);
			}

			const active = await karaoke.eventActive({
				guildId: interaction.guildId,
				eventId
			});
			if (active) {
				return interaction.defaultFollowup('That event is not active. Run `/manage karaoke menu` to see the updated menu.', true);
			}

			const event = await karaoke.getEvent({ eventId });

			if (shouldLock && event!.locked) {
				return interaction.defaultFollowup('Queue is already locked.', true);
			}
			if (!shouldLock && !event!.locked) {
				return interaction.defaultFollowup('Queue is already unlocked.', true);
			}

			const updatedEvent = await karaoke.updateQueueLock({ eventId }, !event!.locked);

			const updatedPage = KaraokeEventMenu.pageUpdateLock(menu, updatedEvent);
			return menu.updatePage(updatedPage);
		} catch (err) {
			this.container.logger.error(err);
			return interaction.errorFollowup('There was an error when trying to toggle the queue lock.', true);
		}
	}

	public override async parse(interaction: ButtonInteraction<'cached'>) {
		if (!this.customIds.some((id) => interaction.customId.startsWith(id))) return this.none();

		const menu = await KaraokeEventMenu.handlers.get(interaction.user.id);
		if (isNullish(menu)) {
			await interaction.defaultReply('Please run `/manage karaoke menu` again.', true);
			return this.none();
		}

		const settings = await this.container.events.getSettings(interaction.guildId);
		if (isNullish(settings) || !settings.enabled) {
			await interaction.errorReply(`The module for this feature is disabled.\nYou can run \`/events toggle\` to enable it.`);
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
