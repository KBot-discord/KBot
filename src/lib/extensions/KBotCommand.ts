// Imports
import { Command, container } from '@sapphire/framework';

// Types
import type { IdHints } from '../types/config';
import { BaseCommandInteraction, MessageEmbed } from 'discord.js';
import { embedColors } from '../util/constants';


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

BaseCommandInteraction.prototype.defaultReply = function defaultReply(text: string) {
    const embed = new MessageEmbed().setColor(embedColors.default).setDescription(text);
    return (this.deferred || this.replied)
        ? this.editReply({ embeds: [embed] })
        : this.reply({ embeds: [embed] });
};

BaseCommandInteraction.prototype.successReply = function successReply(text: string) {
    const embed = new MessageEmbed().setColor(embedColors.success).setDescription(text);
    return (this.deferred || this.replied)
        ? this.editReply({ embeds: [embed] })
        : this.reply({ embeds: [embed] });
};

BaseCommandInteraction.prototype.errorReply = function errorReply(text: string) {
    const embed = new MessageEmbed().setColor(embedColors.error).setDescription(text);
    return (this.deferred || this.replied)
        ? this.editReply({ embeds: [embed] })
        : this.reply({ embeds: [embed] });
};
