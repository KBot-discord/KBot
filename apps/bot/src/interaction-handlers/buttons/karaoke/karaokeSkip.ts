import { KaraokeCustomIds } from '#utils/customIds';
import { interactionRatelimit, validCustomId } from '#utils/decorators';
import { isNullOrUndefined, parseCustomId } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { Time } from '@sapphire/duration';
import { ButtonInteraction } from 'discord.js';
import type { GuildTextBasedChannel } from 'discord.js';
import type { KaraokeMenuButton } from '#types/CustomIds';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.Button
})
export class ButtonHandler extends InteractionHandler {
	public override async run(interaction: ButtonInteraction<'cached'>, { eventId }: InteractionHandler.ParseResult<this>): Promise<void> {
		const { karaoke } = this.container.events;

		const exists = await karaoke.eventExists(interaction.guildId, eventId);
		if (!exists) {
			return void interaction.defaultReply('There is no event to skip. Run `/manage karaoke menu` to see the updated menu.');
		}

		const active = await karaoke.eventActive(interaction.guildId, eventId);
		if (!active) {
			return void interaction.defaultReply('That event is not active. Run `/manage karaoke menu` to see the updated menu.');
		}

		const event = await karaoke.getEventWithQueue(eventId);
		if (!event) {
			this.container.logger.sentryMessage('Failed to fetch an event that was set as active', {
				context: { eventId }
			});
			return;
		}

		if (event.queue.length === 0) {
			return void interaction.defaultReply('There is no user to skip.');
		}

		const textChannel = (await interaction.guild.channels.fetch(event.textChannelId)) as GuildTextBasedChannel;

		await karaoke.skipQueue(interaction.guild.members, event, textChannel, interaction.user.id);

		await interaction.defaultReply('User skipped.');
	}

	@validCustomId(KaraokeCustomIds.Skip)
	@interactionRatelimit(Time.Second * 5, 1)
	// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
	public override async parse(interaction: ButtonInteraction) {
		if (!interaction.inCachedGuild()) {
			return this.none();
		}

		const settings = await this.container.events.settings.get(interaction.guildId);
		if (isNullOrUndefined(settings) || !settings.enabled) {
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
