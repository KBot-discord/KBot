import { EvalCustomIds, EvalFields } from '#utils/customIds';
import { validCustomId } from '#utils/decorators';
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes, Result } from '@sapphire/framework';
import { ModalSubmitInteraction, codeBlock } from 'discord.js';
import { inspect } from 'util';

type EvalOptions = {
	interaction: ModalSubmitInteraction<'cached'>;
};

@ApplyOptions<InteractionHandler.Options>({
	name: EvalCustomIds.Eval,
	interactionHandlerType: InteractionHandlerTypes.ModalSubmit
})
export class ModalHandler extends InteractionHandler {
	public override async run(
		interaction: ModalSubmitInteraction<'cached'>, //
		{ code }: InteractionHandler.ParseResult<this>
	): Promise<void> {
		const result = await Result.fromAsync(async () => this.eval(code, { interaction }));

		await result.match({
			ok: async (data) => {
				if (data.length > 1999) {
					return interaction.editReply({
						content: this.formatContent({ input: code, result: 'Error: too many characters' })
					});
				}

				return interaction.editReply({
					content: this.formatContent({ input: code, result: data })
				});
			},
			err: async (error) => {
				if (error instanceof Error) {
					await interaction.editReply({
						content: this.formatContent({ input: code, result: error.stack! })
					});
				}
			}
		});
	}

	@validCustomId(EvalCustomIds.Eval)
	public override async parse(interaction: ModalSubmitInteraction<'cached'>) {
		await interaction.deferReply({ ephemeral: true });

		const code = interaction.fields.getTextInputValue(EvalFields.Code);

		return this.some({ code });
	}

	/**
	 * Evaluate any JS/TS code.
	 * @param code - The code to evaluate
	 * @param options - The options to be made available in the eval function
	 */
	// @ts-expect-error This is so `eval` can access `options`
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	private async eval(code: string, options: EvalOptions): Promise<string> {
		// eslint-disable-next-line no-eval
		const result = eval(code);

		return this.clean(result);
	}

	/**
	 * Clean the result of the `eval` call.
	 * @param result - The result
	 */
	private async clean(result: string): Promise<string> {
		if (typeof result !== 'string') {
			result = inspect(result, { depth: 1 });
		}

		result = result
			.replace(/`/g, `\`${String.fromCharCode(8203)}`) //
			.replace(/@/g, `@${String.fromCharCode(8203)}`);

		return result;
	}

	private formatContent({ input, result }: { input: string; result: string }): string {
		return `Input:${codeBlock('ts', input)}\nResult:${codeBlock('ts', result)}`;
	}
}
