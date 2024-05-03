import { KaraokeCustomIds } from '../../lib/utilities/customIds.js';
import { interactionRatelimit, validCustomId } from '../../lib/utilities/decorators.js';
import { fetchChannel, parseCustomId } from '../../lib/utilities/discord.js';
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { Time } from '@sapphire/duration';
import { ButtonInteraction } from 'discord.js';
import { isNullOrUndefined } from '@sapphire/utilities';
import type { GuildTextBasedChannel } from 'discord.js';
import type { KaraokeMenuButton } from '../../lib/types/CustomIds.js';

@ApplyOptions<InteractionHandler.Options>({
	name: KaraokeCustomIds.Skip,
	interactionHandlerType: InteractionHandlerTypes.Button
})
export class ButtonHandler extends InteractionHandler {
	public override async run(interaction: ButtonInteraction<'cached'>, { eventId }: InteractionHandler.ParseResult<this>): Promise<void> {
		const { karaoke } = this.container.events;

		const event = await karaoke.getEventWithQueue(eventId);
		if (!event) {
			this.container.logger.sentryMessage('Failed to fetch an event for a menu', {
				context: { eventId, piece: this, interaction }
			});
			return;
		}

		if (!event.isActive) {
			return void interaction.defaultFollowup('That event is not active. Run `/manage karaoke menu` to see the updated menu.', {
				ephemeral: true
			});
		}

		if (event.queue.length === 0) {
			return void interaction.defaultReply('There is no user to skip.');
		}

		const textChannel = await fetchChannel<GuildTextBasedChannel>(event.textChannelId);

		await karaoke.skipQueue(interaction.guild, event, textChannel!, interaction.user.id);

		await interaction.defaultReply('User skipped.');
	}

	@validCustomId(KaraokeCustomIds.Skip)
	@interactionRatelimit(Time.Second * 5, 1)
	public override async parse(interaction: ButtonInteraction<'cached'>) {
		const settings = await this.container.events.settings.get(interaction.guildId);
		if (isNullOrUndefined(settings) || !settings.enabled) {
			await interaction.errorReply(`The module for this feature is disabled.\nYou can run \`/events toggle\` to enable it.`, {
				tryEphemeral: true
			});
			return this.none();
		}

		await interaction.deferReply({ ephemeral: true });

		const {
			data: { eventId }
		} = parseCustomId<KaraokeMenuButton>(interaction.customId);

		return this.some({ eventId });
	}
}
