import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import type { ButtonInteraction } from 'discord.js';
import type { IKaraokeMenuCustomId, Key } from '../../../lib/types/keys';
import { parseKey } from '../../../lib/util/keys';
import { KaraokeCustomIds } from '../../../lib/types/enums';
import { isNullish } from '@sapphire/utilities';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.Button
})
export class ButtonHandler extends InteractionHandler {
	public override async run(interaction: ButtonInteraction, { eventId }: InteractionHandler.ParseResult<this>) {
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

	public override async parse(interaction: ButtonInteraction) {
		if (!interaction.customId.startsWith(KaraokeCustomIds.Skip)) return this.none();

		const { eventId } = parseKey<IKaraokeMenuCustomId>(interaction.customId as Key);
		await interaction.deferReply({ ephemeral: true });

		return this.some({ eventId });
	}
}
