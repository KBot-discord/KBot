import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import type { ButtonInteraction } from 'discord.js';
import type { IKaraokeMenuCustomId, Key } from '../../../lib/types/keys';
import { parseKey } from '../../../lib/util/keys';
import { KaraokeCustomIds } from '../../../lib/types/enums';
import { MessageEmbed, StageChannel, TextChannel, VoiceChannel } from 'discord.js';
import { EmbedColors } from '../../../lib/util/constants';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.Button
})
export class ButtonHandler extends InteractionHandler {
	public override async run(interaction: ButtonInteraction, { voiceChannel, textChannel, event, pingRole }: InteractionHandler.ParseResult<this>) {
		const { karaoke } = this.container;

		try {
			const eventExists = await karaoke.db.doesEventExist(voiceChannel.id);
			if (eventExists) {
				return interaction.editReply({
					embeds: [new MessageEmbed().setColor(EmbedColors.Default).setDescription('There is already an event going on.')]
				});
			}

			await event.setStatus('ACTIVE');
			await this.container.karaoke.startEvent(interaction, voiceChannel, textChannel, event.name, pingRole);
			await karaoke.db.setEventStatus(voiceChannel.id, true);

			return interaction.defaultReply('Event started.');
		} catch (err) {
			this.container.logger.error(err);
			return interaction.errorReply('There was an error trying to start the event.');
		}
	}

	public override async parse(interaction: ButtonInteraction) {
		if (!interaction.customId.startsWith(KaraokeCustomIds.Start)) return this.none();

		const { eventId } = parseKey<IKaraokeMenuCustomId>(interaction.customId as Key);
		await interaction.deferReply({ ephemeral: true });

		const event = await this.container.karaoke.db.fetchEvent(eventId);
		const scheduledEvent = await interaction.guild!.scheduledEvents.fetch(event!.scheduleId!);

		const [voiceChannel, textChannel] = await Promise.all([
			(await interaction.guild!.channels.fetch(event!.id)) as StageChannel | VoiceChannel,
			(await interaction.guild!.channels.fetch(event!.channel)) as TextChannel
		]);

		return this.some({ voiceChannel, textChannel, event: scheduledEvent, pingRole: event!.role! });
	}
}
