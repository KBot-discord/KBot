import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandlerTypes } from '@sapphire/framework';
import { type ButtonInteraction, MessageEmbed, StageChannel, VoiceChannel } from 'discord.js';
import { KaraokeCustomIds } from '../../../lib/types/CustomIds';
import { EmbedColors } from '../../../lib/util/constants';
import { DeferOptions, MenuInteractionHandler } from '@kbotdev/menus';
import type { KaraokeMenuButton } from '../../../lib/types/CustomIds';

@ApplyOptions<MenuInteractionHandler.Options>({
	customIdPrefix: [KaraokeCustomIds.Stop],
	defer: DeferOptions.Reply,
	ephemeral: true,
	interactionHandlerType: InteractionHandlerTypes.Button
})
export class ButtonHandler extends MenuInteractionHandler {
	public override async run(interaction: ButtonInteraction, { data: { eventId } }: MenuInteractionHandler.Result<KaraokeMenuButton>) {
		const { karaoke } = this.container;
		const guildId = interaction.guildId!;

		try {
			const eventExists = await karaoke.db.doesEventExist(guildId, eventId);
			if (!eventExists) {
				return interaction.editReply({
					embeds: [new MessageEmbed().setColor(EmbedColors.Default).setDescription('There is no event to end.')]
				});
			}

			const eventChannel = (await interaction.guild!.channels.fetch(eventId)) as StageChannel | VoiceChannel;
			if (eventChannel.type === 'GUILD_STAGE_VOICE') {
				if (eventChannel.stageInstance) await eventChannel.stageInstance.delete();
			}
			await karaoke.db.setEventStatus(guildId, eventId, false);
			await karaoke.db.deleteEvent(eventId);

			return interaction.successReply('Karaoke event ended.');
		} catch (err) {
			this.container.logger.error(err);
			return interaction.errorReply('There was an error trying to end the event.');
		}
	}
}
