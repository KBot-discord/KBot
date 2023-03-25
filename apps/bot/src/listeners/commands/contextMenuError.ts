import { Events, Listener } from '@sapphire/framework';
import { RESTJSONErrorCodes } from 'discord-api-types/v10';
import { DiscordAPIError, HTTPError } from 'discord.js';
import * as Sentry from '@sentry/node';
import { ApplyOptions } from '@sapphire/decorators';
import type { ContextMenuCommandErrorPayload } from '@sapphire/framework';

const codesToIgnore = [RESTJSONErrorCodes.UnknownChannel, RESTJSONErrorCodes.UnknownMessage];

@ApplyOptions<Listener.Options>({
	name: Events.ContextMenuCommandError
})
export class CommandListener extends Listener {
	public async run(error: Error, { interaction }: ContextMenuCommandErrorPayload) {
		if (error instanceof DiscordAPIError || error instanceof HTTPError) {
			if (codesToIgnore.includes(error.status)) {
				return;
			}
		}

		Sentry.captureException(error);

		return interaction.errorReply('Something went wrong, please try that command again.', true);
	}
}
