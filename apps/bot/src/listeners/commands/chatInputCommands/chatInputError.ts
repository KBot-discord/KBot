import { Events, Listener } from '@sapphire/framework';
import { RESTJSONErrorCodes } from 'discord-api-types/v10';
import { DiscordAPIError, HTTPError } from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';
import type { ChatInputCommandErrorPayload } from '@sapphire/framework';

const codesToIgnore = [RESTJSONErrorCodes.UnknownChannel, RESTJSONErrorCodes.UnknownMessage];

@ApplyOptions<Listener.Options>({
	event: Events.ChatInputCommandError
})
export class CommandListener extends Listener<typeof Events.ChatInputCommandError> {
	public async run(error: Error, payload: ChatInputCommandErrorPayload): Promise<void> {
		const { command, interaction } = payload;

		if (error instanceof DiscordAPIError || error instanceof HTTPError) {
			if (codesToIgnore.includes(error.status)) return;
		}

		this.container.metrics.incrementCommand({
			command: command.name,
			success: false
		});

		this.container.logger.sentryError(error, payload);

		await interaction.errorReply('There was an error when running your command.', true);
	}
}
