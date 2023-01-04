import { KaraokeCustomIds } from '#utils/constants';
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import { parseCustomId } from '@kbotdev/custom-id';
import type { ButtonInteraction } from 'discord.js';
import type { KaraokeMenuButton } from '#lib/types/CustomIds';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.Button
})
export class ButtonHandler extends InteractionHandler {
	private readonly customIds = [KaraokeCustomIds.Skip];

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
		if (!this.customIds.some((id) => interaction.customId.startsWith(id))) return this.none();
		await interaction.deferReply({ ephemeral: true });

		const {
			data: { eventId }
		} = parseCustomId<KaraokeMenuButton>(interaction.customId);

		return this.some({ eventId });
	}
}
