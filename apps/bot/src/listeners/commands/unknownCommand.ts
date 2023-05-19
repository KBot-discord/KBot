import { KBotErrors } from '#types/Enums';
import { Listener } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import type { UnknownCommandPayload } from '#types/Errors';

@ApplyOptions<Listener.Options>({
	event: KBotErrors.UnknownCommand
})
export class CommandListener extends Listener<typeof KBotErrors.UnknownCommand> {
	public async run(payload: UnknownCommandPayload): Promise<void> {
		const { interaction } = payload;

		if (interaction.command) {
			const commandName = interaction.command.name;
			const subcommandGroup = interaction.options.getSubcommandGroup();
			const subcommand = interaction.options.getSubcommand();

			this.container.logger.sentryMessage(`There was no method to process "${commandName}/${subcommandGroup}/${subcommand}"`, payload);
		} else {
			this.container.logger.sentryMessage('Received an interaction with no command', payload);
		}

		await interaction.errorReply('I was not able to find the command you were trying to run.', true);
	}
}
