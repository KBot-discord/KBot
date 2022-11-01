// Imports
import { KBotCommand } from "./KBotCommand";
import { Command } from "@sapphire/framework";


export abstract class KBotSubcommand extends KBotCommand {
    protected constructor(context: Command.Context, options: Command.Options) {
        super(context, { ...options });
    }
}
