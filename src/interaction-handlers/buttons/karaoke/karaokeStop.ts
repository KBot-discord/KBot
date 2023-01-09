import { EmbedColors, KaraokeCustomIds } from '#utils/constants';
import { KaraokeEventMenu } from '#lib/structures/KaraokeEventMenu';
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { type ButtonInteraction, ChannelType, GuildScheduledEventStatus, EmbedBuilder, StageChannel, VoiceChannel } from 'discord.js';
import { parseCustomId } from '@kbotdev/custom-id';
import type { KaraokeMenuButton } from '#lib/types/CustomIds';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.Button
})
export class ButtonHandler extends InteractionHandler {
	private readonly customIds = [KaraokeCustomIds.Stop];

	public override async run(interaction: ButtonInteraction, { menu, eventId }: InteractionHandler.ParseResult<this>) {
		const { karaoke } = this.container;
		const guildId = interaction.guildId!;

		try {
			const eventExists = await karaoke.repo.doesEventExist(guildId, eventId);
			if (!eventExists) {
				return interaction.editReply({
					embeds: [new EmbedBuilder().setColor(EmbedColors.Default).setDescription('There is no event to end.')]
				});
			}

			const eventChannel = (await interaction.guild!.channels.fetch(eventId)) as StageChannel | VoiceChannel;
			if (eventChannel.type === ChannelType.GuildStageVoice) {
				if (eventChannel.stageInstance) await eventChannel.stageInstance.delete();
			}

			const events = await interaction.guild!.scheduledEvents.fetch();
			const event = events.find((event) => event.channelId === eventChannel.id);
			if (event) {
				await event.setStatus(GuildScheduledEventStatus.Completed);
			}

			await karaoke.repo.setEventActive(guildId, eventId, false);
			await karaoke.repo.deleteEvent(eventId);

			const updatedPage = KaraokeEventMenu.pageStopEvent(menu);
			return menu.updatePage(updatedPage);
		} catch (err) {
			this.container.logger.error(err);
			return interaction.errorReply('There was an error trying to end the event.');
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

		return this.some({ menu, eventId });
	}
}
