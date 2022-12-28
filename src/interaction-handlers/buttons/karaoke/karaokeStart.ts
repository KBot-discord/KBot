import { EmbedColors, KaraokeCustomIds } from '#utils/constants';
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandlerTypes } from '@sapphire/framework';
import { MessageEmbed, StageChannel, TextChannel, VoiceChannel } from 'discord.js';
import { DeferOptions, MenuInteractionHandler } from '@kbotdev/menus';
import type { ButtonInteraction } from 'discord.js';
import type { KaraokeMenuButton } from '#lib/types/CustomIds';

@ApplyOptions<MenuInteractionHandler.Options>({
	customIdPrefix: [KaraokeCustomIds.Start],
	defer: DeferOptions.Reply,
	ephemeral: true,
	interactionHandlerType: InteractionHandlerTypes.Button
})
export class ButtonHandler extends MenuInteractionHandler {
	public override async run(interaction: ButtonInteraction, { data: { eventId } }: MenuInteractionHandler.Result<KaraokeMenuButton>) {
		const { karaoke } = this.container;
		const guildId = interaction.guildId!;

		try {
			const event = await this.container.karaoke.repo.fetchEvent(eventId);
			const scheduledEvent = await interaction.guild!.scheduledEvents.fetch(event!.scheduleId!);

			const [voiceChannel, textChannel] = await Promise.all([
				(await interaction.guild!.channels.fetch(event!.id)) as StageChannel | VoiceChannel,
				(await interaction.guild!.channels.fetch(event!.channel)) as TextChannel
			]);

			const eventExists = await karaoke.repo.doesEventExist(guildId, voiceChannel.id);
			if (eventExists) {
				return interaction.editReply({
					embeds: [new MessageEmbed().setColor(EmbedColors.Default).setDescription('There is already an event going on.')]
				});
			}

			await scheduledEvent.setStatus('ACTIVE');
			await this.container.karaoke.startEvent(interaction, voiceChannel, textChannel, scheduledEvent.name, event!.role!);
			await karaoke.repo.setEventStatus(guildId, voiceChannel.id, true);

			return interaction.defaultReply('Event started.');
		} catch (err) {
			this.container.logger.error(err);
			return interaction.errorReply('There was an error trying to start the event.');
		}
	}
}
