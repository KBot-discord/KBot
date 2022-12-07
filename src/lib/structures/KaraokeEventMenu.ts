import { GuildChannel, Message, MessageActionRow, MessageButton, MessageComponentInteraction, MessageEmbed } from 'discord.js';
import { channelMention, time } from '@discordjs/builders';
import { container } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import { BaseMenu, IArrowCustomId } from './BaseMenu';
import { ArrowCustomId, KaraokeCustomIds } from '../types/enums';
import { buildKey, parseKey } from '../util/keys';
import { BlankSpace, EmbedColors } from '../util/constants';
import type { IKaraokeMenuCustomId, Key } from '../types/keys';
import type { Event } from '@prisma/client';

export class KaraokeEventMenu extends BaseMenu {
	private events: { event: Event; channel: GuildChannel }[] = [];

	public async run() {
		try {
			this.reply = (await this.interaction.fetchReply()) as Message;

			const embeds = await this.buildEmbeds();
			this.pages = this.buildPages(embeds);

			this.collector = this.reply.createMessageComponentCollector({
				filter: (i) => i.user.id === this.interaction.user.id && i.customId.startsWith(ArrowCustomId)
			});
			this.collector.on('collect', this.parse);
			this.collector.on('stop', this.handleStop);

			return this.showMenu();
		} catch (err) {
			return container.logger.error(err);
		}
	}

	private async parse(interaction: MessageComponentInteraction): Promise<void> {
		const { dir, index } = parseKey<IArrowCustomId>(interaction.customId as Key);
		return this.handleArrow(interaction, dir, index);
	}

	private buildPages(embeds: MessageEmbed[]): { embeds: MessageEmbed[]; components: MessageActionRow[] }[] {
		const pages = embeds.map((embed, index) => {
			const { event } = this.events[index];

			const components = embeds.length > 0 ? [this.buildArrowButtons(index + 1)] : [];
			components.push(...this.buildComponents(event));
			return { embeds: [embed], components };
		});
		const components = embeds.length > 0 ? [this.buildArrowButtons(0)] : [];
		pages.unshift({
			embeds: [
				new MessageEmbed()
					.setColor(EmbedColors.Default)
					.setAuthor({ name: 'Karaoke management', iconURL: this.interaction.guild!.iconURL()! })
					.setTitle('Karaoke event management')
					.addFields([
						{ name: 'Instructions:', value: 'text' },
						{ name: 'More text:', value: 'even more text' }
					])
					.setFooter({ text: `1 / ${this.events.length + 1}` })
			],
			components: [
				...components,
				new MessageActionRow().addComponents([
					new MessageButton().setCustomId(KaraokeCustomIds.Create).setStyle('SUCCESS').setLabel('Create an event'),
					new MessageButton().setCustomId(KaraokeCustomIds.Schedule).setStyle('SUCCESS').setLabel('Schedule an event')
				])
			]
		});
		return pages;
	}

	private buildComponents(event: Event) {
		return [
			new MessageActionRow().addComponents(
				isNullish(event.scheduleId)
					? [
							{ id: KaraokeCustomIds.Add, text: 'Add to queue' },
							{ id: KaraokeCustomIds.Remove, text: 'Remove from queue' },
							{ id: KaraokeCustomIds.Lock, text: 'Lock queue' },
							{ id: KaraokeCustomIds.Unlock, text: 'Unlock queue' },
							{ id: KaraokeCustomIds.Skip, text: 'Skip queue' }
					  ].map(({ id, text }) =>
							new MessageButton()
								.setCustomId(buildKey<IKaraokeMenuCustomId>(id, { eventId: event.id }))
								.setStyle('SECONDARY')
								.setLabel(text)
					  )
					: event.id
					? [
							new MessageButton()
								.setCustomId(buildKey<IKaraokeMenuCustomId>(KaraokeCustomIds.Start, { eventId: event.id }))
								.setStyle('SECONDARY')
								.setLabel('Start event')
					  ]
					: []
			),
			new MessageActionRow().addComponents(
				isNullish(event.scheduleId)
					? [{ id: KaraokeCustomIds.Stop, text: 'End the event' }].map(({ id, text }) =>
							new MessageButton()
								.setCustomId(buildKey<IKaraokeMenuCustomId>(id, { eventId: event.id }))
								.setStyle('SECONDARY')
								.setLabel(text)
					  )
					: event.id
					? [
							new MessageButton()
								.setCustomId(buildKey<IKaraokeMenuCustomId>(KaraokeCustomIds.Start, { eventId: event.id }))
								.setStyle('SECONDARY')
								.setLabel('Start event')
					  ]
					: []
			)
		];
	}

	private async buildEmbeds(): Promise<MessageEmbed[]> {
		const { karaoke, client } = container;
		const { guild } = this.interaction;

		this.events = await Promise.all(
			((await karaoke.db.fetchEvents(guild!.id!)) ?? []).map(async (event) => ({
				event,
				channel: (await client.channels.fetch(event.id)) as GuildChannel
			}))
		);

		return Promise.all(
			this.events.map(async ({ event, channel }, index) => {
				const fields: { name: string; value: string; inline: boolean }[] = [];
				if (event.scheduleId) {
					const scheduledEvent = await guild!.scheduledEvents.fetch(event.scheduleId);
					fields.push(
						{ name: 'Scheduled event:', value: scheduledEvent.name, inline: true },
						{ name: 'Event time:', value: time(scheduledEvent.scheduledStartTimestamp!), inline: true },
						{ name: BlankSpace, value: BlankSpace, inline: false }
					);
				}
				return new MessageEmbed()
					.setColor(EmbedColors.Default)
					.setAuthor({ name: 'Karaoke management', iconURL: this.interaction.guild!.iconURL()! })
					.setTitle(`Event #${index + 1} | ${channel.name}`)
					.addFields([
						...fields,
						{ name: 'Voice channel:', value: channelMention(event.id), inline: true },
						{ name: 'Command channel:', value: channelMention(event.channel), inline: true }
					])
					.setFooter({ text: `${index + 2} / ${this.events.length + 1}` });
			})
		);
	}
}
