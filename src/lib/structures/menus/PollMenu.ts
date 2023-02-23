import { EmbedColors, PollCustomIds } from '#utils/constants';
import { buildCustomId } from '#utils/customIds';
import { getGuildIcon } from '#utils/Discord';
import { Menu, MenuPageBuilder, MenuPagesBuilder } from '@kbotdev/menus';
import { ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { container } from '@sapphire/framework';
import { time } from '@discordjs/builders';
import type { Guild, Message, User } from 'discord.js';
import type { Poll } from '#prisma';
import type { AnyInteractableInteraction } from '@sapphire/discord.js-utilities';
import type { PollMenuButton } from '#types/CustomIds';

export class PollMenu extends Menu {
	private guild;
	private polls: Poll[] = [];

	public constructor(guild: Guild) {
		super();
		this.guild = guild;
	}

	public override async run(messageOrInteraction: Message | AnyInteractableInteraction, target?: User) {
		const embeds = await this.buildEmbeds();
		const pages = this.buildPages(embeds);

		this.setSelectMenuPlaceholder('Select a poll');
		this.setSelectMenuOptions((pageIndex) => {
			if (pageIndex === 1) return { label: `Home page` };
			return { label: `Poll #${pageIndex - 1}` };
		});

		this.setPages(pages);
		this.setHomePage((builder) =>
			builder.setEmbeds((embed) => {
				return [
					embed
						.setColor(EmbedColors.Default)
						.setAuthor({ name: 'Poll management', iconURL: getGuildIcon(this.guild) })
						.addFields([
							{ name: 'Instructions:', value: 'text' },
							{ name: 'More text:', value: 'even more text' }
						])
				];
			})
		);

		return super.run(messageOrInteraction, target);
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
									{ id: PollCustomIds.End, text: 'End poll' }
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
		const {
			utility: { polls }
		} = container;
		const { guild } = this;

		const fetchedPolls = await polls.fetchByGuildId(guild.id!);
		this.polls = fetchedPolls ?? [];

		if (fetchedPolls.length === 0) {
			return [];
		}

		return this.polls.map((poll, index) => {
			return new EmbedBuilder()
				.setColor(EmbedColors.Default)
				.setAuthor({ name: 'Poll management', iconURL: getGuildIcon(guild) })
				.setTitle(`Poll #${index + 1} | ${poll.title}`)
				.addFields([
					{ name: 'Options', value: poll.options.join('\n') },
					{ name: 'Ends at:', value: time(Math.floor(Number(poll.time) / 1000)) }
				]);
		});
	}
}
