import { KBotErrors } from '#types/Enums';
import { Listener } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import type { Payload } from '#types/Errors';

@ApplyOptions<Listener.Options>({
	name: KBotErrors.UnknownCommand
})
export class CommandListener extends Listener {
	public async run({ interaction }: Payload<KBotErrors.UnknownCommand>) {
		const commandName = interaction.command!.name;
		const subcommandGroup = interaction.options.getSubcommandGroup();
		const subcommand = interaction.options.getSubcommand();

		this.container.logger.fatal(`[Unknown Command] There was no method to process "${commandName}/${subcommandGroup}/${subcommand}"`);
		return interaction.errorReply("Not sure how you did that, but I'm not able to process that command.", true);
	}
}
