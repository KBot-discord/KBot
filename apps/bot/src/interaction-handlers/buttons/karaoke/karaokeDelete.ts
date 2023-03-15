import { KaraokeCustomIds } from '#utils/constants';
import { parseCustomId } from '#utils/customIds';
import { KaraokeEventMenu } from '#structures/menus/KaraokeEventMenu';
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import type { ButtonInteraction } from 'discord.js';
import type { KaraokeMenuButton } from '#types/CustomIds';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.Button
})
export class ButtonHandler extends InteractionHandler {
	private readonly customIds = [KaraokeCustomIds.Delete];

	public override async run(interaction: ButtonInteraction<'cached'>, { menu, eventId }: InteractionHandler.ParseResult<this>) {
		const { events } = this.container;

		try {
			const settings = await events.getSettings(interaction.guildId);
			if (isNullish(settings) || !settings.enabled) {
				return interaction.errorReply(`The module for this feature is disabled.\nYou can run \`/events toggle\` to enable it.`);
			}

			const exists = await events.karaoke.eventExists({
				guildId: interaction.guildId,
				eventId
			});
			if (!exists) {
				return interaction.defaultFollowup('There is no event to delete. Run `/manage karaoke menu` to see the updated menu.', true);
			}

			const active = await events.karaoke.eventActive({
				guildId: interaction.guildId,
				eventId
			});
			if (active) {
				return interaction.defaultFollowup('That event is not active. Run `/manage karaoke menu` to see the updated menu.', true);
			}

			await events.karaoke.deleteScheduledEvent({
				guildId: interaction.guildId,
				eventId
			});

			const updatedPage = KaraokeEventMenu.pageDeleteScheduledEvent(menu);
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
