import { isFunction } from '#utils/functions';
import { encode } from '#utils/discord';
import { EmbedBuilder } from 'discord.js';
import type { PaginatedMessageAction, PaginatedMessageMessageOptionsUnion, PaginatedMessagePage } from '@sapphire/discord.js-utilities';

export class MenuPageBuilder {
	public readonly page: PaginatedMessageMessageOptionsUnion;

	public constructor(page?: PaginatedMessageMessageOptionsUnion) {
		this.page = page ?? { embeds: [], actions: [] };
	}

	public addEmbed(embed: EmbedBuilder | ((embed: EmbedBuilder) => EmbedBuilder)): this {
		if (!this.page.embeds) this.page.embeds = [];
		this.page.embeds.push(isFunction(embed) ? embed(new EmbedBuilder()) : embed);
		return this;
	}

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

	public addAction(action: PaginatedMessageAction): this {
		if (!this.page.actions) this.page.actions = [];
		this.page.actions.push(action);
		return this;
	}

	public setActions(actions: PaginatedMessageAction[]): this {
		for (const action of actions) this.addAction(action);
		return this;
	}

	public editEmbed(index: number, embed: (builder: EmbedBuilder) => EmbedBuilder): this {
		if (!this.page.embeds) this.page.embeds = [];

		const embedAt = this.page.embeds.at(index);
		const newEmbed = embed(new EmbedBuilder(encode(embedAt)));
		this.page.embeds[index] = newEmbed;

		return this;
	}

	public build(): PaginatedMessagePage {
		return this.page;
	}
}