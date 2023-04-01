import { Events, Listener } from '@sapphire/framework';
import { RESTJSONErrorCodes } from 'discord-api-types/v10';
import { DiscordAPIError, HTTPError } from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';
import { captureException } from '@sentry/node';
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

		captureException(error);

		return interaction.errorReply('Something went wrong, please try that command again.', true);
	}
}
