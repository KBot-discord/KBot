import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { type ButtonInteraction, MessageEmbed, StageChannel, VoiceChannel } from 'discord.js';
import type { IKaraokeMenuCustomId, Key } from '../../../lib/types/keys';
import { parseKey } from '../../../lib/util/keys';
import { KaraokeCustomIds } from '../../../lib/types/enums';
import { EmbedColors } from '../../../lib/util/constants';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.Button
})
export class ButtonHandler extends InteractionHandler {
	public override async run(interaction: ButtonInteraction, { eventId }: InteractionHandler.ParseResult<this>) {
		const { karaoke } = this.container;

		try {
			const eventExists = await karaoke.db.doesEventExist(eventId);
			if (!eventExists) {
				return interaction.editReply({
					embeds: [new MessageEmbed().setColor(EmbedColors.Default).setDescription('There is no event to end.')]
				});
			}

			const eventChannel = (await interaction.guild!.channels.fetch(eventId)) as StageChannel | VoiceChannel;
			if (eventChannel.type === 'GUILD_STAGE_VOICE') {
				if (eventChannel.stageInstance) await eventChannel.stageInstance.delete();
			}
			await karaoke.db.setEventStatus(eventId, false);
			await karaoke.db.deleteEvent(eventId);

			return interaction.successReply('Karaoke event ended.');
		} catch (err) {
			this.container.logger.error(err);
			return interaction.errorReply('There was an error trying to end the event.');
		}
	}

	public override async parse(interaction: ButtonInteraction) {
		if (!interaction.customId.startsWith(KaraokeCustomIds.Stop)) return this.none();

		const { eventId } = parseKey<IKaraokeMenuCustomId>(interaction.customId as Key);
		await interaction.deferReply({ ephemeral: true });

		return this.some({ eventId });
	}
}
