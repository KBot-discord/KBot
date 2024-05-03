import { Menu } from './Menu.js';
import { EmbedColors } from '../../utilities/constants.js';
import { PollCustomIds } from '../../utilities/customIds.js';
import { buildCustomId, getGuildIcon } from '../../utilities/discord.js';
import { MenuPageBuilder } from '../builders/MenuPageBuilder.js';
import { ButtonStyle, ComponentType, EmbedBuilder } from 'discord.js';
import { container } from '@sapphire/framework';
import { time } from '@discordjs/builders';
import type { APIEmbedField, Guild, Message, User } from 'discord.js';
import type { AnyInteractableInteraction } from '@sapphire/discord.js-utilities';
import type { Poll } from '@prisma/client';
import type { PollMenuButton } from '../../types/CustomIds.js';

export class PollMenu extends Menu {
	private readonly guild: Guild;
	private polls: Poll[] = [];

	public constructor(guild: Guild) {
		super();

		this.guild = guild;
	}

	public override async run(messageOrInteraction: AnyInteractableInteraction | Message, target?: User): Promise<this> {
		const embeds = await this.buildEmbeds();
		const pages = this.buildPages(embeds);

		this.setSelectMenuPlaceholder('Select a poll');
		this.setSelectMenuOptions((pageIndex) => {
			if (pageIndex === 1) return { label: `Home page` };
			return { label: `Poll #${pageIndex - 1}` };
		});

		this.setMenuPages(pages);
		this.setHomePage((builder) =>
			builder.setEmbeds((embed) => {
				return [
					embed
						.setColor(EmbedColors.Default)
						.setAuthor({ name: 'Poll management', iconURL: getGuildIcon(this.guild) })
						.addFields([{ name: 'Creating a poll', value: 'Run `/poll create`' }])
				];
			})
		);

		return await super.run(messageOrInteraction, target);
	}

	private buildPages(embeds: EmbedBuilder[]): MenuPageBuilder[] {
		return embeds.map((embed, index) => {
			const poll = this.polls[index];
			return new MenuPageBuilder() //
				.setEmbeds([embed])
				.setActions([
					{
						type: ComponentType.Button,
						style: ButtonStyle.Primary,
						customId: buildCustomId<PollMenuButton>(PollCustomIds.ResultsHidden, {
							pollId: poll.id
						}),
						label: 'Show current votes (hidden)'
					},
					{
						type: ComponentType.Button,
						style: ButtonStyle.Primary,
						customId: buildCustomId<PollMenuButton>(PollCustomIds.ResultsPublic, {
							pollId: poll.id
						}),
						label: 'Show current votes (public)'
					},
					{
						type: ComponentType.Button,
						style: ButtonStyle.Primary,
						customId: buildCustomId<PollMenuButton>(PollCustomIds.End, {
							pollId: poll.id
						}),
						label: 'End poll'
					}
				]);
		});
	}

	private async buildEmbeds(): Promise<EmbedBuilder[]> {
		const {
			utility: { polls }
		} = container;
		const { guild } = this;

		const fetchedPolls = await polls.getByGuild(guild.id);
		this.polls = fetchedPolls;

		return this.polls.map((poll, index) => {
			const fields: APIEmbedField[] = [{ name: 'Options', value: poll.options.join('\n') }];

			if (poll.time) {
				fields.push({ name: 'Ends at:', value: time(Math.floor(Number(poll.time) / 1000)) });
			}

			return new EmbedBuilder()
				.setColor(EmbedColors.Default)
				.setAuthor({ name: 'Poll management', iconURL: getGuildIcon(guild) })
				.setTitle(`Poll #${index + 1} | ${poll.title}`)
				.addFields(fields);
		});
	}
}
