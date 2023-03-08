import { Menu, MenuPageBuilder, MenuPagesBuilder } from '@kbotdev/menus';
import { container } from '@sapphire/framework';
import type { EmbedBuilder, Message, User } from 'discord.js';
import type { AnyInteractableInteraction } from '@sapphire/discord.js-utilities';
import type { ModerationCase } from '#prisma';

export class ModerationCaseMenu extends Menu {
	private moderationCases: ModerationCase[];

	public constructor(cases: ModerationCase[]) {
		super();
		this.moderationCases = cases;
	}

	public override async run(messageOrInteraction: Message | AnyInteractableInteraction, target?: User) {
		const embeds = this.buildEmbeds();
		const pages = this.buildPages(embeds);

		await this.setPages(pages);

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
