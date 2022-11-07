// Imports
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { MessageEmbed, ModalSubmitInteraction, StageChannel, TextChannel, VoiceChannel } from 'discord.js';
import { embedColors } from '../../lib/util/constants';
import { KaraokeCustomIds } from '../../lib/types/enums';
import { isNullish } from '@sapphire/utilities';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.ModalSubmit
})
export class ModalHandler extends InteractionHandler {
	public override async run(
		modal: ModalSubmitInteraction,
		{ voiceChannel, textChannel, stageTopic, pingRole }: InteractionHandler.ParseResult<this>
	) {
		const { karaoke } = this.container;
		try {
			const eventExists = await karaoke.doesEventExist(voiceChannel!.id);
			if (eventExists) {
				return modal.followUp({
					embeds: [new MessageEmbed().setColor(embedColors.default).setDescription('There is already a karaoke event')]
				});
			}

			// TODO check if bot has proper perms for voice and/or text channel

			const embed = new MessageEmbed();
			if (voiceChannel.type === 'GUILD_STAGE_VOICE') {
				if (isNullish(voiceChannel.stageInstance)) {
					embed.setTitle(`Event: ${stageTopic ? `${stageTopic}` : 'Karaoke Event'}`);
					await voiceChannel.createStageInstance({ topic: stageTopic ? `${stageTopic}` : 'Karaoke Event' });
				} else embed.setTitle(`Event: ${voiceChannel.stageInstance.topic}`);
			} else {
				embed.setTitle('Event: Karaoke Event');
			}

			await modal.followUp({
				embeds: [new MessageEmbed().setColor(embedColors.success).setDescription('Event started.')],
				ephemeral: true
			});

			const announcement = await textChannel.send({
				content: `${pingRole || ''}A karaoke event has started!`,
				embeds: [
					embed.setColor(embedColors.default).addFields(
						{ name: '**Voice channel:** ', value: `<#${voiceChannel.id}>` },
						{ name: '**Text channel:** ', value: `<#${textChannel.id}>`, inline: true },
						{
							name: '**Instructions:**',
							value: `**1.** Join the karaoke queue by running the \`\`/karaoke join\`\` slash command. The updated queue list will be shown in <#${textChannel.id}>
								**2.** Once your turn comes up, you will be invited to become a speaker on the stage.
								**3.** After singing, you can either leave the stage by muting your mic, clicking the "Move to audience" button, leaving the stage, or running the \`\`/karaoke leave\`\` slash command.`
						}
					)
				],
				allowedMentions: { parse: ['roles'] }
			});
			await announcement.pin();

			await karaoke.setEventExistence(voiceChannel.id, true);
			await karaoke.setEventStatus(voiceChannel.id, true);
			return karaoke.createEvent(voiceChannel.guildId, voiceChannel.id, textChannel.id, announcement.id);
		} catch {
			return modal.followUp({
				embeds: [new MessageEmbed().setColor(embedColors.error).setDescription('Failed to create event')],
				ephemeral: true
			});
		}
	}

	public override async parse(modal: ModalSubmitInteraction) {
		if (!modal.customId.startsWith(KaraokeCustomIds.ModalCreate)) return this.none();
		await modal.deferUpdate();

		const voiceField = modal.fields.getTextInputValue('karaokeCreateVoice');
		const textField = modal.fields.getTextInputValue('karaokeCreateText');
		const topicField = modal.fields.getTextInputValue('karaokeCreateTopic');
		const roleField = modal.fields.getTextInputValue('karaokeCreateRole');

		const {
			0: voiceChannel,
			1: textChannel,
			2: stageTopic,
			3: pingRole
		} = await Promise.all([
			(await modal.guild!.channels.fetch(voiceField)) as StageChannel | VoiceChannel,
			(await modal.guild!.channels.fetch(textField)) as TextChannel,
			topicField,
			roleField
		]);

		return this.some({ voiceChannel, textChannel, stageTopic, pingRole });
	}
}
