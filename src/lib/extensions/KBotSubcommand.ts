// Imports
import { container } from '@sapphire/framework';
import { Subcommand } from '@sapphire/plugin-subcommands';

// Types
import type { IdHints } from '../types/config';


export abstract class KBotSubcommand extends Subcommand {
    protected constructor(context: Subcommand.Context, options: Subcommand.Options) {
        super(context, { ...options });
        if (!!this.description && !this.detailedDescription) this.detailedDescription = this.description;
    }

    public getIdHints(commandName: string): string[] | undefined {
        return container.config.discord.idHints[commandName.toLowerCase() as keyof IdHints];
    }

    public getGuildIds(): string[] | undefined {
        return container.config.isDev
            ? container.config.discord.devServers
            : undefined;
    }
}
