// Imports
import { Events, Listener, type ChatInputCommandErrorPayload } from '@sapphire/framework';
import { RESTJSONErrorCodes } from 'discord-api-types/v10';
import { DiscordAPIError, HTTPError } from 'discord.js';
import * as Sentry from '@sentry/node';
import { ApplyOptions } from '@sapphire/decorators';

const codesToIgnore = [RESTJSONErrorCodes.UnknownChannel, RESTJSONErrorCodes.UnknownMessage];

@ApplyOptions<Listener.Options>({
	name: Events.ChatInputCommandError
})
export class CommandErrorListener extends Listener {
	public async run(error: Error, { command, interaction }: ChatInputCommandErrorPayload) {
		const { logger } = this.container;

		if (error instanceof DiscordAPIError || error instanceof HTTPError) {
			if (codesToIgnore.includes(error.code)) {
				return;
			}
		}
		Sentry.captureException(error);
		logger.fatal(`[COMMAND] Error while executing: ${command.location.full}\n${error.stack || error.message}`);
		return interaction.errorReply('Something went wrong, please try that command again.');
	}
}
