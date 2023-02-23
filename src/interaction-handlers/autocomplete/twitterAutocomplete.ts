import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import type { ApplicationCommandOptionChoiceData, AutocompleteInteraction } from 'discord.js';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.Autocomplete
})
export class AutocompleteHandler extends InteractionHandler {
	private readonly commandName = 'twitter';

	public override async run(interaction: AutocompleteInteraction, result: InteractionHandler.ParseResult<this>) {
		return interaction.respond(result);
	}

	public override async parse(interaction: AutocompleteInteraction) {
		if (interaction.commandName !== this.commandName) return this.none();

		const { notifications } = this.container;
		const focusedOption = interaction.options.getFocused(true);

		if (focusedOption.name === 'account') {
			const accounts = await notifications.twitter.getAutocompleteAccount(focusedOption.value);
			if (isNullish(accounts)) return this.some([]);

			const accountOptions: ApplicationCommandOptionChoiceData[] = accounts.map(({ id, name }) => ({ name, value: id }));

			return this.some(accountOptions);
		}

		return this.none();
	}
}
