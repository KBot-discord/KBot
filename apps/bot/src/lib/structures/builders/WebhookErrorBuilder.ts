import { EmbedColors } from '#utils/constants';
import { EmbedBuilder } from 'discord.js';
import type { APIEmbedField } from 'discord.js';

export class WebhookErrorBuilder {
	private readonly data: EmbedBuilder;

	public constructor() {
		this.data = new EmbedBuilder().setColor(EmbedColors.Error);
	}

	public setAuthor(author: string): this {
		this.data.setAuthor({ name: author });
		return this;
	}

	public setTitle(title: string): this {
		this.data.setTitle(title);
		return this;
	}

	public setDescription(description: string): this {
		this.data.setDescription(description);
		return this;
	}

	public setFields(fields: APIEmbedField[]): this {
		this.data.setFields(fields);
		return this;
	}

	public addFields(fields: APIEmbedField[]): this {
		this.data.addFields(fields);
		return this;
	}

	public build(): EmbedBuilder {
		this.data.setTimestamp();
		return this.data;
	}
}
