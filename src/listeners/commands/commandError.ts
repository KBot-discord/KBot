import { formGenericError } from '../../lib/utilities/constants.js';
import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener, container } from '@sapphire/framework';
import { DiscordAPIError, HTTPError, RESTJSONErrorCodes } from 'discord.js';
import type { ChatInputCommandErrorPayload, ContextMenuCommandErrorPayload } from '@sapphire/framework';

const codesToIgnore = [RESTJSONErrorCodes.UnknownChannel, RESTJSONErrorCodes.UnknownMessage];

/**
 * Handle errors passed from the command error listeners.
 * @param data - Data and context about the error
 */
async function handleError(data: {
	message: string;
	error: Error;
	payload: ChatInputCommandErrorPayload | ContextMenuCommandErrorPayload;
}): Promise<void> {
	const { error, message, payload } = data;
	const { command, interaction } = payload;

	if (error instanceof DiscordAPIError || error instanceof HTTPError) {
		if (codesToIgnore.includes(error.status)) return;
	}

	container.metrics.incrementCommand({
		command: command.name,
		success: false
	});

	container.logger.sentryError(error, { message, context: payload });

	await interaction.errorReply(formGenericError('There was an error when running your command.'), {
		tryEphemeral: true
	});
}

@ApplyOptions<Listener.Options>({
	name: Events.ChatInputCommandError,
	event: Events.ChatInputCommandError
})
export class ChatInputCommandErrorListener extends Listener<typeof Events.ChatInputCommandError> {
	public async run(error: Error, payload: ChatInputCommandErrorPayload): Promise<void> {
		const { command } = payload;
		const { name, location } = command;

		await handleError({
			message: `Encountered error on chat input command "${name}" at path "${location.full}"`,
			error,
			payload
		});
	}
}

@ApplyOptions<Listener.Options>({
	name: Events.ContextMenuCommandError,
	event: Events.ContextMenuCommandError
})
export class ContextMenuCommandErrorListener extends Listener<typeof Events.ContextMenuCommandError> {
	public async run(error: Error, payload: ContextMenuCommandErrorPayload): Promise<void> {
		const { command } = payload;
		const { name, location } = command;

		await handleError({
			message: `Encountered error on message command "${name}" at path "${location.full}"`,
			error,
			payload
		});
	}
}
