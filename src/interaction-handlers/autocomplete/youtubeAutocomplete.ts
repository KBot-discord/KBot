import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import type { AutocompleteInteraction } from 'discord.js';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.Autocomplete
})
export class AutocompleteHandler extends InteractionHandler {
	public override async run(interaction: AutocompleteInteraction, result: InteractionHandler.ParseResult<this>) {
		return interaction.respond(result);
	}

	public override async parse(interaction: AutocompleteInteraction) {
		if (interaction.commandName !== 'youtube') return this.none();

		const focusedOption = interaction.options.getFocused(true);

		switch (focusedOption.name) {
			case 'account': {
				const { channelsList } = await this.container.youtube.channels.getAutocompleteChannel(focusedOption.value);
				return this.some(channelsList.map(({ id, name }) => ({ name, value: id })));
			}
			default:
				return this.none();
		}
	}
}
