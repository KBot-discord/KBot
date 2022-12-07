import { BaseMenu, IArrowCustomId } from './BaseMenu';
import { Message, MessageActionRow, MessageButton, MessageComponentInteraction, MessageEmbed } from 'discord.js';
import { buildKey, parseKey } from '../util/keys';
import { ArrowCustomId, PollCustomIds } from '../types/enums';
import { EmbedColors } from '../util/constants';
import { container } from '@sapphire/framework';
import { time } from '@discordjs/builders';
import type { IPollMenuCustomId, Key } from '../types/keys';
import type { Poll } from '@prisma/client';

export class PollMenu extends BaseMenu {
	private polls: Poll[] = [];

	public async run() {
		this.reply = (await this.interaction.fetchReply()) as Message;

		const embeds = await this.buildEmbeds();
		this.pages = this.buildPages(embeds);

		this.collector = this.reply.createMessageComponentCollector({
			filter: (i) => i.user.id === this.interaction.user.id && i.customId.startsWith(ArrowCustomId)
		});
		this.collector.on('collect', (interaction) => this.parse(interaction));
		this.collector.on('stop', (interaction) => this.handleStop(interaction, true));

		return this.showMenu();
	}

	private async parse(interaction: MessageComponentInteraction): Promise<void> {
		const { dir, index } = parseKey<IArrowCustomId>(interaction.customId as Key);
		return this.handleArrow(interaction, dir, index);
	}

	private buildPages(embeds: MessageEmbed[]): { embeds: MessageEmbed[]; components: MessageActionRow[] }[] {
		const pages = embeds.map((embed, index) => {
			const poll = this.polls[index];

			const components = embeds.length > 0 ? [this.buildArrowButtons(index + 1)] : [];
			components.push(
				new MessageActionRow().addComponents(
					[
						{ id: PollCustomIds.ResultsHidden, text: 'Show results (hidden)' },
						{ id: PollCustomIds.ResultsPublic, text: 'Show results (public)' },
						{ id: PollCustomIds.End, text: 'End a poll' }
					].map(({ id, text }) =>
						new MessageButton()
							.setCustomId(buildKey<IPollMenuCustomId>(id, { pollId: poll.id }))
							.setStyle('PRIMARY')
							.setLabel(text)
					)
				)
			);
			return { embeds: [embed], components };
		});
		const components = embeds.length > 0 ? [this.buildArrowButtons(0)] : [];
		pages.unshift({
			embeds: [
				new MessageEmbed()
					.setColor(EmbedColors.Default)
					.setAuthor({ name: 'Poll management', iconURL: this.interaction.guild!.iconURL()! })
					.addFields([
						{ name: 'Instructions:', value: 'text' },
						{ name: 'More text:', value: 'even more text' }
					])
					.setFooter({ text: `1 / ${this.polls.length + 1}` })
			],
			components: [...components]
		});
		return pages;
	}

	private async buildEmbeds(): Promise<MessageEmbed[]> {
		const { polls } = container;
		const { guild } = this.interaction;

		this.polls = (await polls.db.getPollsWithUsers(guild!.id!)) ?? [];

		return Promise.all(
			this.polls.map((poll, index) => {
				return new MessageEmbed()
					.setColor(EmbedColors.Default)
					.setAuthor({ name: 'Poll management', iconURL: this.interaction.guild!.iconURL()! })
					.setTitle(`Poll #${index + 1} | ${poll.title}`)
					.addFields([
						{ name: 'Options', value: poll.options.join('\n') },
						{ name: 'Ends at:', value: time(Math.floor(Number(poll.time) / 1000)) }
					])
					.setFooter({ text: `${index + 2} / ${this.polls.length + 1}` });
			})
		);
	}
}
