import { EmbedColors, PollCustomIds } from '#utils/constants';
import { Menu, MenuPageBuilder, MenuPagesBuilder } from '@kbotdev/menus';
import { ButtonBuilder, ButtonStyle, EmbedBuilder, Guild, Message, User } from 'discord.js';
import { container } from '@sapphire/framework';
import { time } from '@discordjs/builders';
import { buildCustomId } from '@kbotdev/custom-id';
import type { Poll } from '@prisma/client';
import type { AnyInteractableInteraction } from '@sapphire/discord.js-utilities';
import type { PollMenuButton } from '../types/CustomIds';

export class PollMenu extends Menu {
	private guild;
	private polls: Poll[] = [];

	public constructor(guild: Guild) {
		super();
		this.guild = guild;
	}

	public override async run(messageOrInteraction: Message | AnyInteractableInteraction, target?: User) {
		await this.build();
		return super.run(messageOrInteraction, target);
	}

	public async build() {
		const embeds = await this.buildEmbeds();
		const pages = this.buildPages(embeds);

		await this.setPages(pages);

		await this.setHomePage((builder) =>
			builder.setEmbeds((embed) => {
				return [
					embed
						.setColor(EmbedColors.Default)
						.setAuthor({ name: 'Poll management', iconURL: this.guild.iconURL()! })
						.addFields([
							{ name: 'Instructions:', value: 'text' },
							{ name: 'More text:', value: 'even more text' }
						])
				];
			})
		);
	}

	private buildPages(embeds: EmbedBuilder[]): MenuPagesBuilder {
		return new MenuPagesBuilder().setPages(
			embeds.map((embed, index) => {
				const poll = this.polls[index];
				return new MenuPageBuilder() //
					.setEmbeds([embed])
					.setComponentRows((row) => {
						return [
							row.addComponents(
								[
									{ id: PollCustomIds.ResultsHidden, text: 'Show results (hidden)' },
									{ id: PollCustomIds.ResultsPublic, text: 'Show results (public)' },
									{ id: PollCustomIds.End, text: 'End a poll' }
								].map(({ id, text }) =>
									new ButtonBuilder()
										.setCustomId(buildCustomId<PollMenuButton>(id, { pollId: poll.id }))
										.setStyle(ButtonStyle.Primary)
										.setLabel(text)
								)
							)
						];
					});
			})
		);
	}

	private async buildEmbeds(): Promise<EmbedBuilder[]> {
		const { polls } = container;
		const { guild } = this;

		this.polls = (await polls.repo.getPollsWithUsers(guild.id!)) ?? [];

		return Promise.all(
			this.polls.map((poll, index) => {
				return new EmbedBuilder()
					.setColor(EmbedColors.Default)
					.setAuthor({ name: 'Poll management', iconURL: guild.iconURL()! })
					.setTitle(`Poll #${index + 1} | ${poll.title}`)
					.addFields([
						{ name: 'Options', value: poll.options.join('\n') },
						{ name: 'Ends at:', value: time(Math.floor(Number(poll.time) / 1000)) }
					]);
			})
		);
	}
}
