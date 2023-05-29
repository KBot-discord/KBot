import { isFunction } from '#utils/functions';
import { MenuPageBuilder } from '#structures/builders/MenuPageBuilder';
import { PaginatedMessage } from '@sapphire/discord.js-utilities';
import type { AnyInteractableInteraction } from '@sapphire/discord.js-utilities';

export abstract class Menu extends PaginatedMessage {
	public setHomePage(page: MenuPageBuilder | ((builder: MenuPageBuilder) => MenuPageBuilder)): this {
		const resolvedPage = (isFunction(page) ? page(new MenuPageBuilder()) : page).build();
		if (this.pages.length > 0) {
			this.pages.unshift(resolvedPage);
		} else {
			this.pages.push(resolvedPage);
		}

		return this;
	}

	public setMenuPages(pages: MenuPageBuilder[]): this {
		super.setPages(pages.map((page) => page.build()));

		return this;
	}

	public async updateMenuPage(interaction: AnyInteractableInteraction, embed: (builder: MenuPageBuilder) => MenuPageBuilder): Promise<void> {
		const pageOptions = await this.getPageOptions(this.index);
		const page = embed(new MenuPageBuilder(pageOptions));
		await this.updateCurrentPage(page.build());

		const options = this.messages[this.index]!;
		if (interaction.deferred || interaction.replied) {
			await interaction.editReply(options);
		} else {
			await interaction.reply({ ...options, content: options.content ?? undefined });
		}
	}

	public static getInstance(userId: string): Menu | undefined {
		return PaginatedMessage.handlers.get(userId) as Menu | undefined;
	}
}
