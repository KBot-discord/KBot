import { KaraokeCustomIds, parseCustomId } from '#utils/customIds';
import { interactionRatelimit, validCustomId } from '#utils/decorators';
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import { Time } from '@sapphire/duration';
import { ButtonInteraction } from 'discord.js';
import type { GuildTextBasedChannel } from 'discord.js';
import type { KaraokeMenuButton } from '#types/CustomIds';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.Button
})
export class ButtonHandler extends InteractionHandler {
	public override async run(interaction: ButtonInteraction<'cached'>, { eventId }: InteractionHandler.ParseResult<this>) {
		const { karaoke } = this.container.events;

		try {
			const exists = await karaoke.eventExists({
				guildId: interaction.guildId,
				eventId
			});
			if (!exists) {
				return interaction.defaultReply('There is no event to skip. Run `/manage karaoke menu` to see the updated menu.');
			}

			const active = await karaoke.eventActive({
				guildId: interaction.guildId,
				eventId
			});
			if (!active) {
				return interaction.defaultReply('That event is not active. Run `/manage karaoke menu` to see the updated menu.');
			}

			const event = await karaoke.getEventWithQueue({ eventId });

			if (event!.queue.length === 0) {
				return interaction.defaultReply('There is no user to skip.');
			}

			const textChannel = (await interaction.guild.channels.fetch(event!.textChannelId)) as GuildTextBasedChannel;

			await karaoke.skipQueue(interaction.guild.members, event!, textChannel, interaction.user.id);

			return interaction.defaultReply('User skipped.');
		} catch (err) {
			this.container.logger.error(err);
			return interaction.errorReply('There was an error when trying to skip the user.', true);
		}
	}

	@validCustomId(KaraokeCustomIds.Skip)
	@interactionRatelimit(Time.Second * 5, 1)
	public override async parse(interaction: ButtonInteraction<'cached'>) {
		const settings = await this.container.events.getSettings(interaction.guildId);
		if (isNullish(settings) || !settings.enabled) {
			await interaction.errorReply(`The module for this feature is disabled.\nYou can run \`/events toggle\` to enable it.`, true);
			return this.none();
		}

		await interaction.deferReply({ ephemeral: true });

		const {
			data: { eventId }
		} = parseCustomId<KaraokeMenuButton>(interaction.customId);

		return this.some({ eventId });
	}
}
