import { EmbedColors } from '#lib/utilities/constants';
import { EmbedBuilder } from 'discord.js';
import type { APIEmbedField } from 'discord.js';

export class HelpEmbedBuilder {
	private readonly embed = new EmbedBuilder();
	private type: 'Context-menu command' | 'Slash command' | undefined = undefined;
	private target: string | undefined = undefined;
	private readonly optionsField: string[] = [];
	private subcommandsField: string[] = [];

	/**
	 * Set the type of command.
	 * @param type - The command type
	 */
	public setType(type: 'Context-menu command' | 'Slash command'): this {
		this.type = type;
		return this;
	}

	/**
	 * If a Context-Menu command, sets the target of the Context-Menu.
	 * @param target - The target of the menu
	 */
	public setTarget(target: 'message' | 'user'): this {
		this.target = target;
		return this;
	}

	/**
	 * Set the name of the command.
	 * @param name - The name of the command
	 */
	public setName(name: string): this {
		this.embed.setTitle(name);
		return this;
	}

	/**
	 * Set the description of the command.
	 * @param description - The description of the command
	 */
	public setDescription(description: string): this {
		this.embed.setDescription(description);
		return this;
	}

	/**
	 * Set the option of a command.
	 * @param data - The option
	 */
	public setOption(data: { label: string }): this {
		const { label } = data;

		this.optionsField.push(`\`${label}\``);
		return this;
	}

	/**
	 * Set the subcommand of a command.
	 * @param subcommands - The subcommands
	 */
	public setSubcommands(subcommands: { label: string; description: string }[]): this {
		this.subcommandsField = subcommands.map(({ label, description }) => `\`${label}\`\n> ${description}`);
		return this;
	}

	/**
	 * Build the resulting {@link EmbedBuilder}
	 */
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
