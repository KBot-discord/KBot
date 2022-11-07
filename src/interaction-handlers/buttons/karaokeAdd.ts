// Imports
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import type { ButtonInteraction } from 'discord.js';
import type { IKaraokeMenuCustomId, Key } from '../../lib/types/keys';
import { parseKey } from '../../lib/util/keys';
import { KaraokeCustomIds } from '../../lib/types/enums';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.Button
})
export class ButtonHandler extends InteractionHandler {
	public override async run(interaction: ButtonInteraction, { eventId }: InteractionHandler.ParseResult<this>) {
		return interaction.editReply(`add: ${eventId}`);
	}

	public override async parse(interaction: ButtonInteraction) {
		if (!interaction.customId.startsWith(KaraokeCustomIds.Add)) return this.none();

		const { eventId } = parseKey<IKaraokeMenuCustomId>(interaction.customId as Key);
		await interaction.deferReply({ ephemeral: true });

		return this.some({ eventId });
	}
}
