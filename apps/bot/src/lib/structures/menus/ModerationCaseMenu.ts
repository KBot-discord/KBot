import { EmbedColors } from '#utils/constants';
import { Menu, MenuPageBuilder, MenuPagesBuilder } from '@kbotdev/menus';
import { container } from '@sapphire/framework';
import type { EmbedBuilder, GuildMember, Message, User } from 'discord.js';
import type { AnyInteractableInteraction } from '@sapphire/discord.js-utilities';
import type { ModerationCase } from '#prisma';

export class ModerationCaseMenu extends Menu {
	private member: GuildMember;
	private moderationCases: ModerationCase[];

	public constructor(member: GuildMember, cases: ModerationCase[]) {
		super();
		this.member = member;
		this.moderationCases = cases;
	}

	public override async run(messageOrInteraction: Message | AnyInteractableInteraction, target?: User) {
		const embeds = this.buildEmbeds();
		const pages = this.buildPages(embeds);

		this.setSelectMenuOptions((index) => {
			return { label: `Case #${this.moderationCases[index - 1].caseId}` };
		});

		this.setPages(pages);
		this.setHomePage((builder) =>
			builder.setEmbeds((embed) => {
				return [
					embed
						.setColor(EmbedColors.Default)
						.setAuthor({ name: `Cases for ${this.member.user.tag}` })
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
		return new MenuPagesBuilder().setPages(
			embeds.map((embed) => {
				return new MenuPageBuilder() //
					.setEmbeds([embed]);
			})
		);
	}

	private buildEmbeds(): EmbedBuilder[] {
		const { cases } = container.moderation;

		return this.moderationCases.map((moderationCase) => {
			return cases.buildEmbed(moderationCase);
		});
	}
}
