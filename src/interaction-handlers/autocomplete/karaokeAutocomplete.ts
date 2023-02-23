import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import type { ApplicationCommandOptionChoiceData, AutocompleteInteraction } from 'discord.js';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.Autocomplete
})
export class AutocompleteHandler extends InteractionHandler {
	private readonly commandName = 'manage';

	public override async run(interaction: AutocompleteInteraction, result: InteractionHandler.ParseResult<this>) {
		return interaction.respond(result);
	}

	public override async parse(interaction: AutocompleteInteraction<'cached'>) {
		if (interaction.commandName !== this.commandName) return this.none();

		const { karaoke } = this.container.events;
		const focusedOption = interaction.options.getFocused(true);

		if (focusedOption.name === 'event') {
			const events = await karaoke.fetchEventsByGuildId(interaction.guildId);
			if (events.length === 0) return this.some([]);

			const channelData = await Promise.all(events.map(({ id }) => interaction.guild.channels.fetch(id)));

			const eventOptions: ApplicationCommandOptionChoiceData[] = channelData //
				.filter((e) => !isNullish(e))
				.map((channel) => ({ name: channel!.name, value: channel!.id }));

			return this.some(eventOptions);
		} else if (focusedOption.name === 'discord_event') {
			const discordEvents = await interaction.guild.scheduledEvents.fetch();
			if (discordEvents.size === 0) return this.some([]);

			const discordEventOptions: ApplicationCommandOptionChoiceData[] = discordEvents.map((event) => ({
				name: event.name,
				value: event.id
			}));

			return this.some(discordEventOptions);
		}

		return this.none();
	}
}
