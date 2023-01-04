import { BlankSpace, EmbedColors, Emoji, KaraokeCustomIds } from '#utils/constants';
import { Guild, GuildChannel, Message, MessageButton, MessageEmbed, User } from 'discord.js';
import { Menu, MenuPageBuilder, MenuPagesBuilder } from '@kbotdev/menus';
import { isNullish } from '@sapphire/utilities';
import { container } from '@sapphire/framework';
import { channelMention, time } from '@discordjs/builders';
import { buildCustomId } from '@kbotdev/custom-id';
import type { Event } from '@prisma/client';
import type { KaraokeMenuButton } from '../types/CustomIds';
import type { NonModalInteraction } from '@sapphire/discord.js-utilities';

const KaraokeEventActions = [
	{ id: KaraokeCustomIds.Add, text: 'Add to queue' },
	{ id: KaraokeCustomIds.Remove, text: 'Remove from queue' },
	{ id: KaraokeCustomIds.Lock, text: 'Lock queue' },
	{ id: KaraokeCustomIds.Unlock, text: 'Unlock queue' },
	{ id: KaraokeCustomIds.Skip, text: 'Skip queue' }
];

export class KaraokeEventMenu extends Menu {
	private guild;
	private events: { event: Event; channel: GuildChannel }[] = [];

	public constructor(guild: Guild) {
		super();
		this.guild = guild;
	}

	public override async run(messageOrInteraction: Message | NonModalInteraction, target?: User) {
		await this.build();
		return super.run(messageOrInteraction, target);
	}

	public async build() {
		const embeds = await this.buildEmbeds();
		const pages = this.buildPages(embeds);

		this.setSelectMenuPlaceholder('Select an event');

		this.setSelectMenuOptions((pageIndex) => {
			if (pageIndex === 1) return { label: `Home page` };
			return { label: `Event #${pageIndex - 1} | ${this.events[pageIndex - 2].channel.name}` };
		});

		this.setPages(pages);
		this.setHomePage((builder) =>
			builder
				.setEmbeds((embed) => {
					return [
						embed
							.setColor(EmbedColors.Default)
							.setAuthor({ name: 'Karaoke management', iconURL: this.guild.iconURL()! })
							.setTitle('Karaoke event management')
							.addFields([
								{ name: 'Instructions:', value: 'text' },
								{ name: 'More text:', value: 'even more text' }
							])
					];
				})
				.setComponentRows((row) => {
					return [
						row.addComponents([
							new MessageButton().setCustomId(KaraokeCustomIds.Create).setStyle('SUCCESS').setLabel('Create an event'),
							new MessageButton().setCustomId(KaraokeCustomIds.Schedule).setStyle('SUCCESS').setLabel('Schedule an event')
						])
					];
				})
		);
	}

	private buildPages(embeds: MessageEmbed[]): MenuPagesBuilder {
		return new MenuPagesBuilder().setPages(
			embeds.map((embed, index) => {
				const { event } = this.events[index];
				return new MenuPageBuilder() //
					.setEmbeds([embed])
					.setComponentRows((row1, row2) => {
						return [
							row1.addComponents(
								isNullish(event.scheduleId)
									? KaraokeEventActions.map(({ id, text }) =>
											new MessageButton()
												.setCustomId(buildCustomId<KaraokeMenuButton>(id, { eventId: event.id }))
												.setStyle('SECONDARY')
												.setLabel(text)
									  )
									: event.id
									? [
											new MessageButton()
												.setCustomId(buildCustomId<KaraokeMenuButton>(KaraokeCustomIds.Start, { eventId: event.id }))
												.setStyle('SECONDARY')
												.setLabel('Start event')
									  ]
									: []
							),
							row2.addComponents(
								isNullish(event.scheduleId)
									? [{ id: KaraokeCustomIds.Stop, text: 'End the event' }].map(({ id, text }) =>
											new MessageButton()
												.setCustomId(buildCustomId<KaraokeMenuButton>(id, { eventId: event.id }))
												.setStyle('SECONDARY')
												.setLabel(text)
									  )
									: event.id
									? [
											new MessageButton()
												.setCustomId(buildCustomId<KaraokeMenuButton>(KaraokeCustomIds.Start, { eventId: event.id }))
												.setStyle('SECONDARY')
												.setLabel('Start event')
									  ]
									: []
							)
						];
					});
			})
		);
	}

	private async buildEmbeds(): Promise<MessageEmbed[]> {
		const { karaoke, client } = container;
		const { guild } = this;

		this.events = await Promise.all(
			((await karaoke.repo.fetchEvents(guild.id!)) ?? []).map(async (event) => ({
				event,
				channel: (await client.channels.fetch(event.id)) as GuildChannel
			}))
		);

		return Promise.all(
			this.events.map(async ({ event, channel }, index) => {
				const fields: { name: string; value: string; inline: boolean }[] = [];
				if (event.scheduleId) {
					const scheduledEvent = await guild.scheduledEvents.fetch(event.scheduleId);
					fields.push(
						{ name: 'Scheduled event:', value: scheduledEvent.name, inline: true },
						{ name: 'Event time:', value: time(scheduledEvent.scheduledStartTimestamp!), inline: true },
						{ name: BlankSpace, value: BlankSpace, inline: false }
					);
				}
				return new MessageEmbed()
					.setColor(EmbedColors.Default)
					.setAuthor({ name: 'Karaoke management', iconURL: guild.iconURL()! })
					.setTitle(`Event #${index + 1} | ${channel.name}`)
					.addFields([
						...fields,
						{ name: 'Voice channel:', value: channelMention(event.id), inline: true },
						{ name: 'Command channel:', value: channelMention(event.channel), inline: true },
						{ name: 'Queue lock:', value: event.locked ? `${Emoji.Locked} locked` : `${Emoji.Unlocked} unlocked`, inline: true }
					]);
			})
		);
	}

	public static pageUpdateLock(menu: Menu, event: Event): MenuPageBuilder {
		const page = menu.getCurrentPage();

		// use !event.locked since we are looking for the old value
		const index = page.embeds[0].fields.indexOf({ name: 'Queue lock:', value: `${!event.locked}`, inline: true });
		const lockString = event!.locked ? `${Emoji.Locked} locked` : `${Emoji.Unlocked} unlocked`;

		const embed = new MessageEmbed(page.embeds[0]).spliceFields(index, 1, [{ name: 'Queue lock:', value: lockString, inline: true }]);

		return new MenuPageBuilder(page).setEmbeds([embed]);
	}

	public static pageStopEvent(menu: Menu): MenuPageBuilder {
		const page = menu.getCurrentPage();

		const embed = new MessageEmbed(page.embeds[0]).setFields([]).setDescription('Event has ended.');
		const defaultRows = [page.components[0], page.components[1]];

		return new MenuPageBuilder(page).setEmbeds([embed]).setComponentRows(defaultRows);
	}
}
