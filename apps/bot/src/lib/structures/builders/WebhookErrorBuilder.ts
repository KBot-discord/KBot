import { EmbedColors } from '#lib/utilities/constants';
import { EmbedBuilder } from 'discord.js';
import type { APIEmbedField } from 'discord.js';

export class WebhookErrorBuilder {
	private readonly data: EmbedBuilder;

	public constructor() {
		this.data = new EmbedBuilder().setColor(EmbedColors.Error);
	}

	/**
	 * Set the author of the embed.
	 * @param author - The author to set
	 */
	public setAuthor(author: string): this {
		this.data.setAuthor({ name: author });
		return this;
	}

	/**
	 * Set the title of the embed.
	 * @param title - The title to set
	 */
	public setTitle(title: string): this {
		this.data.setTitle(title);
		return this;
	}

	/**
	 * Set the description of the embed.
	 * @param description - The descriptiont to set
	 */
	public setDescription(description: string): this {
		this.data.setDescription(description);
		return this;
	}

	/**
	 * Set the fields of the embed.
	 * @param fields - The fields to set
	 */
	public setFields(fields: APIEmbedField[]): this {
		this.data.setFields(fields);
		return this;
	}

	/**
	 * Add fields to an embed
	 * @param fields - The fields to add
	 */
	public addFields(fields: APIEmbedField[]): this {
		this.data.addFields(fields);
		return this;
	}

	/**
	 * Build the resulting {@link EmbedBuilder}
	 */
	public build(): EmbedBuilder {
		this.data.setTimestamp();
		return this.data;
	}
}
