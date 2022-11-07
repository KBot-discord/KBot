// Imports
import { Command } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { Subcommand } from '@sapphire/plugin-subcommands';

@ApplyOptions<Command.Options>({
	preconditions: ['GuildOnly']
})
export abstract class KBotCommand extends Command {
	protected constructor(context: Subcommand.Context, options: Subcommand.Options) {
		super(context, { ...options });
		if (Boolean(this.description) && !this.detailedDescription) this.detailedDescription = this.description;
	}
}
