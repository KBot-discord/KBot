import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import type { ApplicationCommandOptionChoiceData, AutocompleteInteraction } from 'discord.js';

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

		const { notifications } = this.container;
		const focusedOption = interaction.options.getFocused(true);

		if (focusedOption.name === 'account') {
			const channels = await notifications.youtube.getAutocompleteChannel(focusedOption.value);
			if (isNullish(channels)) return this.some([]);

			const channelOptions: ApplicationCommandOptionChoiceData[] = channels.map(({ id, name }) => ({ name, value: id }));

			return this.some(channelOptions);
		}

		return this.none();
	}
}
