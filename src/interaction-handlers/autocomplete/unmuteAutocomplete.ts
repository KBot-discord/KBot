import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import type { ApplicationCommandOptionChoiceData, AutocompleteInteraction } from 'discord.js';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.Autocomplete
})
export class AutocompleteHandler extends InteractionHandler {
	private readonly commandName = 'unmute';

	public override async run(interaction: AutocompleteInteraction, result: InteractionHandler.ParseResult<this>) {
		return interaction.respond(result);
	}

	public override async parse(interaction: AutocompleteInteraction<'cached'>) {
		if (interaction.commandName !== this.commandName) return this.none();

		const { mutes } = this.container.moderation;
		const focusedOption = interaction.options.getFocused(true);

		if (focusedOption.name === 'user') {
			const muteEntries = await mutes.fetchByGuildId(interaction.guildId);
			if (muteEntries.length === 0) return this.some([]);

			const userData = await Promise.all(muteEntries.map(({ id }) => interaction.guild.members.fetch(id)));

			const userOptions: ApplicationCommandOptionChoiceData[] = userData //
				.filter((e) => !isNullish(e))
				.map((user) => ({ name: user!.displayName, value: user!.id }));

			return this.some(userOptions);
		}

		return this.none();
	}
}
