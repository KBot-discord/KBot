import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import type { AutocompleteInteraction } from 'discord.js';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.Autocomplete
})
export class AutocompleteHandler extends InteractionHandler {
	private readonly commandName = 'youtube';

	public override async run(interaction: AutocompleteInteraction, result: InteractionHandler.ParseResult<this>) {
		return interaction.respond(result);
	}

	public override async parse(interaction: AutocompleteInteraction) {
		if (interaction.commandName !== this.commandName) return this.none();

		const focusedOption = interaction.options.getFocused(true);

		switch (focusedOption.name) {
			case 'account': {
				const channels = await this.container.youtube.getAutocompleteChannel(focusedOption.value);
				if (!channels) return this.some([]);
				return this.some(channels.map(({ id, name }) => ({ name, value: id })));
			}
			default:
				return this.none();
		}
	}
}
