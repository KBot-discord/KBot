import { encode } from '../../utilities/discord.js';
import { EmbedBuilder } from 'discord.js';
import { isFunction } from '@sapphire/utilities';
import type { PaginatedMessageAction, PaginatedMessageMessageOptionsUnion, PaginatedMessagePage } from '@sapphire/discord.js-utilities';

export class MenuPageBuilder {
	public readonly page: PaginatedMessageMessageOptionsUnion;

	public constructor(page?: PaginatedMessageMessageOptionsUnion) {
		this.page = page ?? { embeds: [], actions: [] };
	}

	/**
	 * Set the embeds of a page.
	 * @param embeds - The embed to set
	 */
	public setEmbeds(
		embeds:
			| EmbedBuilder[]
			| ((
					embed1: EmbedBuilder,
					embed2: EmbedBuilder,
					embed3: EmbedBuilder,
					embed4: EmbedBuilder,
					embed5: EmbedBuilder,
					embed6: EmbedBuilder,
					embed7: EmbedBuilder,
					embed8: EmbedBuilder,
					embed9: EmbedBuilder,
					embed10: EmbedBuilder
			  ) => EmbedBuilder[])
	): this {
		this.page.embeds = isFunction(embeds)
			? embeds(
					new EmbedBuilder(),
					new EmbedBuilder(),
					new EmbedBuilder(),
					new EmbedBuilder(),
					new EmbedBuilder(),
					new EmbedBuilder(),
					new EmbedBuilder(),
					new EmbedBuilder(),
					new EmbedBuilder(),
					new EmbedBuilder()
				)
			: embeds;
		return this;
	}

	/**
	 * Add an action to the page.
	 * @param action - The action to add
	 */
	public addAction(action: PaginatedMessageAction): this {
		if (!this.page.actions) this.page.actions = [];
		this.page.actions.push(action);
		return this;
	}

	/**
	 * Clear and then set the actions of a page.
	 * @param actions - The actions to set
	 */
	public setActions(actions: PaginatedMessageAction[]): this {
		for (const action of actions) this.addAction(action);
		return this;
	}

	/**
	 * Edit the embed at the provided index.
	 * @param index - The index of the embed
	 * @param embed - A callback to edit the embed
	 */
	public editEmbed(index: number, embed: (builder: EmbedBuilder) => EmbedBuilder): this {
		if (!this.page.embeds) this.page.embeds = [];

		const embedAt = this.page.embeds.at(index);
		const newEmbed = embed(new EmbedBuilder(encode(embedAt)));
		this.page.embeds[index] = newEmbed;

		return this;
	}

	/**
	 * Build the resulting {@link PaginatedMessagePage}
	 */
	public build(): PaginatedMessagePage {
		return this.page;
	}
}
