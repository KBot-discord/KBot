// Imports
import { Command, container } from '@sapphire/framework';

// Types
import type { IdHints } from "../types/config";


export abstract class KBotCommand extends Command {
    protected constructor(context: Command.Context, options: Command.Options) {
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

export namespace KBotCommand {
    export type Options = Command.Options
    export type Context = Command.Context
}