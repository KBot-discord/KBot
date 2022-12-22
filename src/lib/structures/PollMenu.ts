import { Menu, PageBuilder, PagesBuilder } from '@kbotdev/menus';
import { Guild, Message, MessageButton, MessageEmbed, User } from 'discord.js';
import { EmbedColors } from '../util/constants';
import { PollCustomIds } from '../types/enums';
import { container } from '@sapphire/framework';
import { time } from '@discordjs/builders';
import type { Poll } from '@prisma/client';
import type { NonModalInteraction } from '@sapphire/discord.js-utilities';
import { buildCustomId } from '@kbotdev/custom-id';
import type { PollMenuButton } from '../types/CustomIds';

export class PollMenu extends Menu {
	private guild;
	private polls: Poll[] = [];

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
		this.setPages(pages);
		this.setHomePage((builder) =>
			builder.setEmbeds((embed) => {
				return [
					embed
						.setColor(EmbedColors.Default)
						.setAuthor({ name: 'Poll management', iconURL: this.guild.iconURL()! })
						.addFields([
							{ name: 'Instructions:', value: 'text' },
							{ name: 'More text:', value: 'even more text' }
						])
						.setFooter({ text: `1 / ${this.polls.length + 1}` })
				];
			})
		);
	}

	private buildPages(embeds: MessageEmbed[]): PagesBuilder {
		return new PagesBuilder().setPages(
			embeds.map((embed, index) => {
				const poll = this.polls[index];
				return new PageBuilder() //
					.setEmbeds([embed])
					.setComponentRows((row) => {
						return [
							row.addComponents(
								[
									{ id: PollCustomIds.ResultsHidden, text: 'Show results (hidden)' },
									{ id: PollCustomIds.ResultsPublic, text: 'Show results (public)' },
									{ id: PollCustomIds.End, text: 'End a poll' }
								].map(({ id, text }) =>
									new MessageButton()
										.setCustomId(buildCustomId<PollMenuButton>(id, { pollId: poll.id }))
										.setStyle('PRIMARY')
										.setLabel(text)
								)
							)
						];
					});
			})
		);
	}

	private async buildEmbeds(): Promise<MessageEmbed[]> {
		const { polls } = container;
		const { guild } = this;

		this.polls = (await polls.db.getPollsWithUsers(guild.id!)) ?? [];

		return Promise.all(
			this.polls.map((poll, index) => {
				return new MessageEmbed()
					.setColor(EmbedColors.Default)
					.setAuthor({ name: 'Poll management', iconURL: guild.iconURL()! })
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
