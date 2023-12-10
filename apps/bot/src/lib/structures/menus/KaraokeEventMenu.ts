import { isNullOrUndefined } from '#lib/utilities/functions';
import { buildCustomId, fetchChannel, getGuildIcon } from '#lib/utilities/discord';
import { KaraokeCustomIds } from '#lib/utilities/customIds';
import { BlankSpace, EmbedColors, KBotEmoji } from '#lib/utilities/constants';
import { MenuPageBuilder } from '#lib/structures/builders/MenuPageBuilder';
import { Menu } from '#lib/structures/menus/Menu';
import { ButtonStyle, ComponentType, EmbedBuilder } from 'discord.js';
import { container } from '@sapphire/framework';
import { channelMention, time } from '@discordjs/builders';
import type { Guild, GuildBasedChannel, Message, User } from 'discord.js';
import type { KaraokeMenuButton } from '#lib/types/CustomIds';
import type { AnyInteractableInteraction, PaginatedMessageAction, PaginatedMessageActionButton } from '@sapphire/discord.js-utilities';
import type { KaraokeEvent } from '@prisma/client';

const KaraokeEventActions: { id: string; text: string; emoji: string | null }[] = [
	{ id: KaraokeCustomIds.Lock, text: 'Lock queue', emoji: KBotEmoji.Locked },
	{ id: KaraokeCustomIds.Unlock, text: 'Unlock queue', emoji: KBotEmoji.Unlocked },
	{ id: KaraokeCustomIds.Skip, text: 'Skip queue', emoji: null }
];

export class KaraokeEventMenu extends Menu {
	private readonly guild;
	private events: { event: KaraokeEvent; channel: GuildBasedChannel }[] = [];

	public constructor(guild: Guild) {
		super();

		this.guild = guild;
	}

	public override async run(messageOrInteraction: AnyInteractableInteraction | Message, target?: User): Promise<this> {
		const embeds = await this.buildEmbeds();
		const pages = this.buildPages(embeds);

		this.setSelectMenuPlaceholder('Select an event');
		this.setSelectMenuOptions((pageIndex) => {
			if (pageIndex === 1) return { label: `Home page` };
			return { label: `Event #${pageIndex - 1} | ${this.events[pageIndex - 2].channel.name}` };
		});

		this.setMenuPages(pages);
		this.setHomePage((builder) =>
			builder.setEmbeds((embed) => {
				return [
					embed
						.setColor(EmbedColors.Default)
						.setAuthor({
							name: `${KBotEmoji.Microphone} Karaoke management `,
							iconURL: getGuildIcon(this.guild)
						})
						.setTitle('Home page')
						.setDescription('This menu allows you to manage events through buttons.')
						.addFields([
							{ name: 'Creating an event', value: 'Run `/manage karaoke start`' },
							{ name: 'Ending an event', value: 'Run `/manage karaoke stop`' },
							{
								name: 'Scheduling an event',
								value: 'After creating the Discord event, you can run `/manage karaoke schedule`'
							}
						])
				];
			})
		);

		return super.run(messageOrInteraction, target);
	}

	private buildPages(embeds: EmbedBuilder[]): MenuPageBuilder[] {
		return embeds.map((embed, index) => {
			const { event } = this.events[index];
			let actions: PaginatedMessageAction[];

			if (isNullOrUndefined(event.discordEventId)) {
				actions = KaraokeEventActions.map(({ id, text, emoji }) => {
					const action: PaginatedMessageActionButton = {
						type: ComponentType.Button,
						style: ButtonStyle.Secondary,
						customId: buildCustomId<KaraokeMenuButton>(id, {
							eventId: event.id
						}),
						label: text
					};
					if (emoji) action.emoji = emoji;
					return action;
				});
			} else {
				actions = [
					{
						type: ComponentType.Button,
						style: ButtonStyle.Danger,
						customId: buildCustomId<KaraokeMenuButton>(KaraokeCustomIds.Unschedule, {
							eventId: event.id
						}),
						label: 'Unschedule event'
					}
				];
			}

			return new MenuPageBuilder() //
				.setEmbeds([embed])
				.setActions(actions);
		});
	}

	private async buildEmbeds(): Promise<EmbedBuilder[]> {
		const {
			events: { karaoke }
		} = container;
		const { guild } = this;

		const event = (await karaoke.getEventByGuild(guild.id)) ?? [];

		const mergedEvents = await Promise.all(
			event.map(async (event) => ({
				event,
				channel: (await fetchChannel<GuildBasedChannel>(event.id))!
			}))
		);

		this.events = mergedEvents.filter((event) => !isNullOrUndefined(event.channel));

		return await Promise.all(
			this.events.map(async ({ event, channel }, index) => {
				const fields: { name: string; value: string; inline: boolean }[] = [];
				if (event.discordEventId) {
					const discordEvent = await guild.scheduledEvents.fetch(event.discordEventId);
					fields.push(
						{ name: 'Scheduled event:', value: discordEvent.name, inline: true },
						{
							name: 'Event time:',
							value: time(Math.floor(discordEvent.scheduledStartTimestamp! / 1000)),
							inline: true
						},
						{ name: BlankSpace, value: BlankSpace, inline: false }
					);
				}

				return new EmbedBuilder()
					.setColor(EmbedColors.Default)
					.setAuthor({
						name: `${KBotEmoji.Microphone} Karaoke management`,
						iconURL: getGuildIcon(guild)
					})
					.setTitle(`Event #${index + 1} | ${channel.name}`)
					.addFields([
						...fields,
						{
							name: 'Voice channel:',
							value: `${channelMention(event.id)}\n\nPermissions:`,
							inline: true
						},
						{ name: 'Text channel:', value: channelMention(event.textChannelId), inline: true },
						{
							name: 'Queue lock:',
							value: event.locked ? `${KBotEmoji.Locked} locked` : `${KBotEmoji.Unlocked} unlocked`,
							inline: true
						}
					]);
			})
		);
	}
}
