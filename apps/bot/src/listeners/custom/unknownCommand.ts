import { KBotErrors } from '#types/Enums';
import { Listener } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import type { UnknownCommandPayload } from '#types/Errors';

@ApplyOptions<Listener.Options>({
	event: KBotErrors.MissingSubcommandHandler
})
export class CustomListener extends Listener<typeof KBotErrors.MissingSubcommandHandler> {
	public async run(payload: UnknownCommandPayload): Promise<void> {
		const { interaction, error } = payload;
		const { command } = error;

		const commandName = command.name;
		const subcommandGroup = interaction.options.getSubcommandGroup();
		const subcommand = interaction.options.getSubcommand();

		this.container.logger.sentryMessage(`There was no method to process "${commandName}/${subcommandGroup}/${subcommand}"`, {
			context: payload
		});

		await interaction.errorReply('I was not able to find the command you were trying to run.', {
			tryEphemeral: true
		});
	}
}
