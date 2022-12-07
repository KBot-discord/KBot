import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import type { ButtonInteraction } from 'discord.js';
import type { IKaraokeMenuCustomId, Key } from '../../../lib/types/keys';
import { parseKey } from '../../../lib/util/keys';
import { KaraokeCustomIds } from '../../../lib/types/enums';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.Button
})
export class ButtonHandler extends InteractionHandler {
	public override async run(interaction: ButtonInteraction, { eventId }: InteractionHandler.ParseResult<this>) {
		const { karaoke } = this.container;

		try {
			const event = await karaoke.db.fetchEvent(eventId);
			if (event!.locked) return interaction.followUp('Queue is already locked.');

			await karaoke.db.updateQueueLock(eventId, true);
			return interaction.followUp('Queue locked.');
		} catch (err) {
			this.container.logger.error(err);
			return interaction.errorReply('There was an error trying to lock the queue.');
		}
	}

	public override async parse(interaction: ButtonInteraction) {
		if (!interaction.customId.startsWith(KaraokeCustomIds.Lock)) return this.none();

		const { eventId } = parseKey<IKaraokeMenuCustomId>(interaction.customId as Key);
		await interaction.deferReply({ ephemeral: true });

		return this.some({ eventId });
	}
}
