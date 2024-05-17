import { ApplyOptions } from '@sapphire/decorators';
import { Time } from '@sapphire/duration';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { isNullOrUndefined } from '@sapphire/utilities';
import type { ButtonInteraction } from 'discord.js';
import { KaraokeEventMenu } from '../../lib/structures/menus/KaraokeEventMenu.js';
import type { KaraokeMenuButton } from '../../lib/types/CustomIds.js';
import { KBotEmoji } from '../../lib/utilities/constants.js';
import { KaraokeCustomIds } from '../../lib/utilities/customIds.js';
import { interactionRatelimit, validCustomId } from '../../lib/utilities/decorators.js';
import { parseCustomId } from '../../lib/utilities/discord.js';

@ApplyOptions<InteractionHandler.Options>({
	name: KaraokeCustomIds.Lock,
	interactionHandlerType: InteractionHandlerTypes.Button,
})
export class ButtonHandler extends InteractionHandler {
	public override async run(
		interaction: ButtonInteraction<'cached'>,
		{ menu, eventId, shouldLock }: InteractionHandler.ParseResult<this>,
	): Promise<void> {
		const { karaoke } = this.container.events;

		const event = await karaoke.getEvent(eventId);
		if (!event) {
			this.container.logger.sentryMessage('Failed to fetch an event for a menu', {
				context: { eventId, piece: this, interaction },
			});
			return;
		}

		if (!event.isActive) {
			return void interaction.defaultFollowup(
				'That event is not active. Run `/manage karaoke menu` to see the updated menu.',
				{
					ephemeral: true,
				},
			);
		}

		if (shouldLock && event.locked) {
			return void interaction.defaultFollowup('Queue is already locked.', {
				ephemeral: true,
			});
		}
		if (!(shouldLock || event.locked)) {
			return void interaction.defaultFollowup('Queue is already unlocked.', {
				ephemeral: true,
			});
		}

		const updatedEvent = await karaoke.updateEvent({
			id: eventId,
			locked: !event.locked,
		});

		const lockString = updatedEvent.locked //
			? `${KBotEmoji.Locked} locked`
			: `${KBotEmoji.Unlocked} unlocked`;

		await menu.updateMenuPage(interaction, (builder) => {
			return builder.editEmbed(0, (embed) => {
				const index = embed.data.fields!.indexOf({
					name: 'Queue lock:',
					value: String(!updatedEvent.locked),
					inline: true,
				});

				return embed.spliceFields(index, 1, {
					name: 'Queue lock:',
					value: lockString,
					inline: true,
				});
			});
		});
	}

	@validCustomId(KaraokeCustomIds.Lock, KaraokeCustomIds.Unlock)
	@interactionRatelimit(Time.Second * 5, 1)
	public override async parse(interaction: ButtonInteraction<'cached'>) {
		const menu = KaraokeEventMenu.getInstance(interaction.user.id);
		if (isNullOrUndefined(menu)) {
			await interaction.defaultReply('Please run `/manage karaoke menu` again.', {
				tryEphemeral: true,
			});
			return this.none();
		}

		const settings = await this.container.events.settings.get(interaction.guildId);
		if (isNullOrUndefined(settings) || !settings.enabled) {
			await interaction.errorReply(
				'The module for this feature is disabled.\nYou can run `/events toggle` to enable it.',
				{
					tryEphemeral: true,
				},
			);
			return this.none();
		}

		await interaction.deferUpdate();

		const {
			prefix,
			data: { eventId },
		} = parseCustomId<KaraokeMenuButton>(interaction.customId);

		const shouldLock = prefix === KaraokeCustomIds.Lock;

		return this.some({ menu, eventId, shouldLock });
	}
}
