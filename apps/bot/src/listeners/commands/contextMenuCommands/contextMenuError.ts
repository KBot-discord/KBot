import { Events, Listener } from '@sapphire/framework';
import { RESTJSONErrorCodes } from 'discord-api-types/v10';
import { DiscordAPIError, HTTPError } from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';
import type { ContextMenuCommandErrorPayload } from '@sapphire/framework';

const codesToIgnore = [RESTJSONErrorCodes.UnknownChannel, RESTJSONErrorCodes.UnknownMessage];

@ApplyOptions<Listener.Options>({
	event: Events.ContextMenuCommandError
})
export class CommandListener extends Listener<typeof Events.ContextMenuCommandError> {
	public async run(error: Error, payload: ContextMenuCommandErrorPayload): Promise<void> {
		const { command, interaction } = payload;
		const { name, location } = command;

		if (error instanceof DiscordAPIError || error instanceof HTTPError) {
			if (codesToIgnore.includes(error.status)) return;
		}

		this.container.metrics.incrementCommand({
			command: command.name,
			success: false
		});

		this.container.logger.sentryError(error, {
			message: `Encountered error on message command "${name}" at path "${location.full}"`,
			context: payload
		});

		await interaction.errorReply('There was an error when running your command.', true);
	}
}
