import { KaraokeCustomIds } from '#utils/constants';
import { parseCustomId } from '#utils/customIds';
import { KaraokeEventMenu } from '#lib/structures/menus/KaraokeEventMenu';
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import type { ButtonInteraction } from 'discord.js';
import type { KaraokeMenuButton } from '#types/CustomIds';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.Button
})
export class ButtonHandler extends InteractionHandler {
	private readonly customIds = [KaraokeCustomIds.Start];

	public override async run(interaction: ButtonInteraction<'cached'>, { menu, eventId }: InteractionHandler.ParseResult<this>) {
		const { karaoke } = this.container.events;

		try {
			const exists = await karaoke.doesEventExist(interaction.guildId, eventId);
			if (!exists) {
				return interaction.defaultReply('There is no event to start. Run `/manage karaoke menu` to see the updated menu.');
			}

			const active = await karaoke.isEventActive(interaction.guildId, eventId);
			if (active) {
				return interaction.defaultReply('The event is already active. Run `/manage karaoke menu` to see the updated menu.');
			}

			const event = await karaoke.fetchEvent(eventId);
			const scheduledEvent = await interaction.guild.scheduledEvents.fetch(event!.discordEventId!);

			await karaoke.startScheduledEvent(interaction.guild, event!, scheduledEvent.name);

			const updatedPage = KaraokeEventMenu.pageStartEvent(menu, eventId);
			return menu.updatePage(updatedPage);
		} catch (err) {
			this.container.logger.error(err);
			return interaction.errorReply('There was an error when trying to start the event.');
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
			data: { eventId }
		} = parseCustomId<KaraokeMenuButton>(interaction.customId);

		return this.some({ menu, eventId });
	}
}
