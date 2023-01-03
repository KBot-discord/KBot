import { KaraokeCustomIds } from '#utils/constants';
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import type { ModalSubmitInteraction, StageChannel, TextChannel, VoiceChannel } from 'discord.js';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.ModalSubmit
})
export class ModalHandler extends InteractionHandler {
	public override async run(
		modal: ModalSubmitInteraction,
		{ voiceChannel, textChannel, stageTopic, pingRole }: InteractionHandler.ParseResult<this>
	) {
		try {
			await this.container.karaoke.startEvent(modal, voiceChannel, textChannel, stageTopic, pingRole);
			return modal.successFollowup('Karaoke event started.', true);
		} catch (err) {
			this.container.logger.error(err);
			return modal.errorFollowup('Failed to create event.', true);
		}
	}

	public override async parse(modal: ModalSubmitInteraction) {
		if (!modal.customId.startsWith(KaraokeCustomIds.ModalCreate)) return this.none();
		await modal.deferUpdate();

		const voiceField = modal.fields.getTextInputValue('karaokeCreateVoice');
		const textField = modal.fields.getTextInputValue('karaokeCreateText');
		const topicField = modal.fields.getTextInputValue('karaokeCreateTopic');
		const roleField = modal.fields.getTextInputValue('karaokeCreateRole');

		const [voiceChannel, textChannel] = await Promise.all([
			(await modal.guild!.channels.fetch(voiceField)) as StageChannel | VoiceChannel,
			(await modal.guild!.channels.fetch(textField)) as TextChannel
		]);

		return this.some({ voiceChannel, textChannel, stageTopic: topicField, pingRole: roleField });
	}
}
