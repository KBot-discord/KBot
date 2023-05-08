import { EmbedColors } from '#utils/constants';
import { EmbedBuilder } from 'discord.js';
import type { APIEmbedField } from 'discord.js';

export class HelpEmbedBuilder {
	private readonly embed = new EmbedBuilder();
	private type: 'Slash command' | 'Context-menu command' | undefined = undefined;
	private target: string | undefined = undefined;
	private optionsField: string[] = [];
	private subcommandsField: string[] = [];

	public setType(type: 'Slash command' | 'Context-menu command'): this {
		this.type = type;
		return this;
	}

	public setTarget(target: 'user' | 'message') {
		this.target = target;
		return this;
	}

	public setName(name: string): this {
		this.embed.setTitle(name);
		return this;
	}

	public setDescription(description: string): this {
		this.embed.setDescription(description);
		return this;
	}

	public setOptions({ label }: { label: string }): this {
		this.optionsField.push(`\`${label}\``);
		return this;
	}

	public setSubcommands(options: { label: string; description: string }[]): this {
		this.subcommandsField = options.map(({ label, description }) => `\`${label}\`\n> ${description}`);
		return this;
	}

	public build(): EmbedBuilder {
		const fields: APIEmbedField[] = [
			{
				name: 'Type',
				value:
					this.type === 'Context-menu command' //
						? `${this.type} (target: ${this.target})`
						: this.type!
			}
		];

		if (this.optionsField.length > 0) {
			fields.push({
				name: 'Options',
				value: this.optionsField.join('\n\n')
			});
		}

		if (this.subcommandsField.length > 0) {
			fields.push({
				name: 'Subcommands',
				value: this.subcommandsField.join('\n\n')
			});
		}

		return this.embed //
			.setColor(EmbedColors.Default)
			.setFields(fields)
			.setFooter({
				text: '<option> - The is option required • [option] - The option is not required'
			});
	}
}
