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
	private readonly customIds = [KaraokeCustomIds.Remove];

	public override async run(interaction: ButtonInteraction, {}: InteractionHandler.ParseResult<this>) {
		try {
			return interaction.errorFollowup('Remove from queue.', true);
		} catch (err) {
			this.container.logger.error(err);
			return interaction.errorFollowup('There was an error when trying to remove you from the queue.', true);
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
			data: { eventId }
		} = parseCustomId<KaraokeMenuButton>(interaction.customId);

		return this.some({ eventId });
	}
}
