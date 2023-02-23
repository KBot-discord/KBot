import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import type { ApplicationCommandOptionChoiceData, AutocompleteInteraction } from 'discord.js';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.Autocomplete
})
export class AutocompleteHandler extends InteractionHandler {
	private readonly commandName = 'unlock';

	public override async run(interaction: AutocompleteInteraction, result: InteractionHandler.ParseResult<this>) {
		return interaction.respond(result);
	}

	public override async parse(interaction: AutocompleteInteraction<'cached'>) {
		if (interaction.commandName !== this.commandName) return this.none();

		const { lockedChannels } = this.container.moderation;
		const focusedOption = interaction.options.getFocused(true);

		if (focusedOption.name === 'channel') {
			const lockedChannelEntries = await lockedChannels.fetchByGuildId(interaction.guildId);
			if (lockedChannelEntries.length === 0) return this.some([]);

			const channelData = await Promise.all(lockedChannelEntries.map(({ id }) => interaction.guild.channels.fetch(id)));

			const channelOptions: ApplicationCommandOptionChoiceData[] = channelData //
				.filter((e) => !isNullish(e))
				.map((channel) => ({ name: channel!.name, value: channel!.id }));

			return this.some(channelOptions);
		}

		return this.none();
	}
}
