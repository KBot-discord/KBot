import { KaraokeCustomIds, parseCustomId } from '#utils/customIds';
import { KaraokeEventMenu } from '#structures/menus/KaraokeEventMenu';
import { validCustomId } from '#utils/decorators';
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import { ButtonInteraction } from 'discord.js';
import type { KaraokeMenuButton } from '#types/CustomIds';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.Button
})
export class ButtonHandler extends InteractionHandler {
	public override async run(interaction: ButtonInteraction<'cached'>, { menu, eventId }: InteractionHandler.ParseResult<this>): Promise<void> {
		const { events } = this.container;

		const exists = await events.karaoke.eventExists(interaction.guildId, eventId);
		if (!exists) {
			return void interaction.defaultFollowup('There is no event to unschedule. Run `/manage karaoke menu` to see the updated menu.', true);
		}

		const active = await events.karaoke.eventActive(interaction.guildId, eventId);
		if (active) {
			return void interaction.defaultFollowup('That event is not active. Run `/manage karaoke menu` to see the updated menu.', true);
		}

		await events.karaoke.deleteScheduledEvent(interaction.guildId, eventId);

		const updatedPage = KaraokeEventMenu.pageUnscheduleEvent(menu);
		await menu.updatePage(updatedPage);
	}

	@validCustomId(KaraokeCustomIds.Unschedule)
	// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
	public override async parse(interaction: ButtonInteraction) {
		if (!interaction.inCachedGuild()) {
			return this.none();
		}

		const menu = KaraokeEventMenu.handlers.get(interaction.user.id);
		if (isNullish(menu)) {
			await interaction.defaultReply('Please run `/manage karaoke menu` again.', true);
			return this.none();
		}

		const settings = await this.container.events.settings.get(interaction.guildId);
		if (isNullish(settings) || !settings.enabled) {
			await interaction.errorReply(`The module for this feature is disabled.\nYou can run \`/events toggle\` to enable it.`, true);
			return this.none();
		}

		await interaction.deferUpdate();

		const {
			data: { eventId }
		} = parseCustomId<KaraokeMenuButton>(interaction.customId);

		return this.some({ menu, eventId });
	}
}
