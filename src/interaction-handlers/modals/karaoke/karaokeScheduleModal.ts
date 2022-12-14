import { EmbedColors, KaraokeCustomIds } from '#utils/constants';
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { EmbedBuilder, ModalSubmitInteraction, TextChannel } from 'discord.js';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.ModalSubmit
})
export class ModalHandler extends InteractionHandler {
	public override async run(
		modal: ModalSubmitInteraction,
		{ voiceChannel, textChannel, scheduleId, pingRole }: InteractionHandler.ParseResult<this>
	) {
		try {
			await this.container.karaoke.repo.createScheduledEvent(modal.guildId!, voiceChannel!.id, textChannel.id, scheduleId, pingRole);
			return modal.followUp('scheduled');
		} catch {
			return modal.followUp({
				embeds: [new EmbedBuilder().setColor(EmbedColors.Error).setDescription('Failed to create event')],
				ephemeral: true
			});
		}
	}

	public override async parse(modal: ModalSubmitInteraction) {
		if (!modal.customId.startsWith(KaraokeCustomIds.ModalSchedule)) return this.none();
		await modal.deferUpdate();

		const scheduleId = modal.fields.getTextInputValue('karaokeScheduleId');
		const textField = modal.fields.getTextInputValue('karaokeScheduleText');
		const roleField = modal.fields.getTextInputValue('karaokeScheduleRole');

		const event = await modal.guild!.scheduledEvents.fetch(scheduleId);
		const textChannel = (await modal.guild!.channels.fetch(textField)) as TextChannel;

		return this.some({ voiceChannel: event.channel, textChannel, scheduleId: event.id, pingRole: roleField });
	}
}
