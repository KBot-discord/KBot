import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandlerTypes } from '@sapphire/framework';
import type { ButtonInteraction } from 'discord.js';
import { KaraokeCustomIds } from '../../../lib/util/constants';
import { isNullish } from '@sapphire/utilities';
import { DeferOptions, MenuInteractionHandler } from '@kbotdev/menus';
import type { KaraokeMenuButton } from '../../../lib/types/CustomIds';

@ApplyOptions<MenuInteractionHandler.Options>({
	customIdPrefix: [KaraokeCustomIds.Skip],
	defer: DeferOptions.Reply,
	ephemeral: true,
	interactionHandlerType: InteractionHandlerTypes.Button
})
export class ButtonHandler extends MenuInteractionHandler {
	public override async run(interaction: ButtonInteraction, { data: { eventId } }: MenuInteractionHandler.Result<KaraokeMenuButton>) {
		const { karaoke } = this.container;

		try {
			const result = await karaoke.skipUser(eventId, interaction.guild!.members, interaction.user.id);
			if (isNullish(result)) return interaction.defaultReply('There is no user to skip.');
			return interaction.defaultReply('User skipped.');
		} catch (err) {
			this.container.logger.error(err);
			return interaction.errorReply('There was an error trying to skip the user.');
		}
	}
}
