import { BlankSpace, EmbedColors, Emoji, KaraokeCustomIds } from '#utils/constants';
import { buildCustomId } from '#utils/customIds';
import { getGuildIcon } from '#utils/Discord';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { Menu, MenuPageBuilder, MenuPagesBuilder } from '@kbotdev/menus';
import { isNullish } from '@sapphire/utilities';
import { container } from '@sapphire/framework';
import { channelMention, time } from '@discordjs/builders';
import type { Guild, GuildChannel, Message, User } from 'discord.js';
import type { KaraokeEvent } from '#prisma';
import type { KaraokeMenuButton } from '#types/CustomIds';
import type { AnyInteractableInteraction } from '@sapphire/discord.js-utilities';

const KaraokeEventActions: { id: string; text: string; emoji: string | null }[] = [
	{ id: KaraokeCustomIds.Lock, text: 'Lock queue', emoji: Emoji.Locked },
	{ id: KaraokeCustomIds.Unlock, text: 'Unlock queue', emoji: Emoji.Unlocked },
	{ id: KaraokeCustomIds.Skip, text: 'Skip queue', emoji: null }
];

export class KaraokeEventMenu extends Menu {
	private guild;
	private events: { event: KaraokeEvent; channel: GuildChannel }[] = [];

	public constructor(guild: Guild) {
		super();
		this.guild = guild;
	}

	public override async run(messageOrInteraction: Message | AnyInteractableInteraction, target?: User) {
		const embeds = await this.buildEmbeds();
		const pages = this.buildPages(embeds);

		this.setSelectMenuPlaceholder('Select an event');
		this.setSelectMenuOptions((pageIndex) => {
			if (pageIndex === 1) return { label: `Home page` };
			return { label: `Event #${pageIndex - 1} | ${this.events[pageIndex - 2].channel.name}` };
		});

		this.setPages(pages);
		this.setHomePage((builder) =>
			builder.setEmbeds((embed) => {
				return [
					embed
						.setColor(EmbedColors.Default)
						.setAuthor({ name: `${Emoji.Microphone} Karaoke management `, iconURL: getGuildIcon(this.guild) })
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

	private buildPages(embeds: EmbedBuilder[]): MenuPagesBuilder {
		const pages: MenuPageBuilder[] = embeds.map((embed, index) => {
			const { event } = this.events[index];
			return new MenuPageBuilder() //
				.setEmbeds([embed])
				.setComponentRows((row1) => {
					if (!isNullish(event.discordEventId)) {
						return [
							row1.addComponents([
								new ButtonBuilder()
									.setCustomId(buildCustomId<KaraokeMenuButton>(KaraokeCustomIds.Start, { eventId: event.id }))
									.setStyle(ButtonStyle.Success)
									.setLabel('Start event'),
								new ButtonBuilder()
									.setCustomId(buildCustomId<KaraokeMenuButton>(KaraokeCustomIds.Delete, { eventId: event.id }))
									.setStyle(ButtonStyle.Danger)
									.setLabel('Delete event')
							])
						];
					}
					return [
						row1.addComponents(
							KaraokeEventActions.map(({ id, text, emoji }) => {
								const button = new ButtonBuilder()
									.setCustomId(buildCustomId<KaraokeMenuButton>(id, { eventId: event.id }))
									.setStyle(ButtonStyle.Secondary)
									.setLabel(text);
								if (emoji) button.setEmoji(emoji);
								return button;
							})
						)
					];
				});
		});

		return new MenuPagesBuilder().setPages(pages);
	}

	private async buildEmbeds(): Promise<EmbedBuilder[]> {
		const {
			events: { karaoke },
			client
		} = container;
		const { guild } = this;

		this.events = await Promise.all(
			((await karaoke.getEventByGuild({ guildId: guild.id })) ?? []).map(async (event) => ({
				event,
				channel: (await client.channels.fetch(event.id)) as GuildChannel
			}))
		);

		return Promise.all(
			this.events.map(async ({ event, channel }, index) => {
				const fields: { name: string; value: string; inline: boolean }[] = [];
				if (event.discordEventId) {
					const discordEvent = await guild.scheduledEvents.fetch(event.discordEventId);
					fields.push(
						{ name: 'Scheduled event:', value: discordEvent.name, inline: true },
						{ name: 'Event time:', value: time(Math.floor(discordEvent.scheduledStartTimestamp! / 1000)), inline: true },
						{ name: BlankSpace, value: BlankSpace, inline: false }
					);
				}
				return new EmbedBuilder()
					.setColor(EmbedColors.Default)
					.setAuthor({ name: `${Emoji.Microphone} Karaoke management`, iconURL: getGuildIcon(guild) })
					.setTitle(`Event #${index + 1} | ${channel.name}`)
					.addFields([
						...fields,
						{ name: 'Voice channel:', value: channelMention(event.id), inline: true },
						{ name: 'Text channel:', value: channelMention(event.textChannelId), inline: true },
						{ name: 'Queue lock:', value: event.locked ? `${Emoji.Locked} locked` : `${Emoji.Unlocked} unlocked`, inline: true }
					]);
			})
		);
	}

	public static pageUpdateLock(menu: Menu, event: KaraokeEvent): MenuPageBuilder {
		const page = menu.getCurrentPage();

		// use !event.locked since we are looking for the old value
		const index = page.embeds[0].data.fields!.indexOf({ name: 'Queue lock:', value: `${!event.locked}`, inline: true });
		const lockString = event!.locked ? `${Emoji.Locked} locked` : `${Emoji.Unlocked} unlocked`;

		const embed = new EmbedBuilder(page.embeds[0].data).spliceFields(index, 1, { name: 'Queue lock:', value: lockString, inline: true });

		return new MenuPageBuilder(page).setEmbeds([embed]);
	}

	public static pageStartEvent(menu: Menu, eventId: string): MenuPageBuilder {
		const page = menu.getCurrentPage();

		const embed = new EmbedBuilder(page.embeds[0].data);
		const rows = [
			page.components[0],
			page.components[1],
			new ActionRowBuilder<ButtonBuilder>().addComponents(
				KaraokeEventActions.map(({ id, text, emoji }) => {
					const button = new ButtonBuilder()
						.setCustomId(buildCustomId<KaraokeMenuButton>(id, { eventId }))
						.setStyle(ButtonStyle.Secondary)
						.setLabel(text);
					if (emoji) button.setEmoji(emoji);
					return button;
				})
			)
		];

		return new MenuPageBuilder(page).setEmbeds([embed]).setComponentRows(rows);
	}

	public static pageDeleteScheduledEvent(menu: Menu): MenuPageBuilder {
		const page = menu.getCurrentPage();

		const embed = new EmbedBuilder(page.embeds[0].data).setFields([]).setDescription('Event has been deleted.');
		const defaultRows = [page.components[0], page.components[1]];

		return new MenuPageBuilder(page).setEmbeds([embed]).setComponentRows(defaultRows);
	}
}
