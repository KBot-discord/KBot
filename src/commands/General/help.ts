// Imports
import {
    Collection,
    MessageEmbed,
} from 'discord.js';
import { Command, container } from '@sapphire/framework';
import { PaginatedMessage } from '@sapphire/discord.js-utilities';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { KBotCommand } from '../../lib/extensions/KBotCommand';
import { embedColors } from '../../lib/util/constants';
import { ApplyOptions } from '@sapphire/decorators';

// Types
import type { ChatInputCommand } from '@sapphire/framework';


function sortCommandsAlphabetically(_: KBotCommand[], __: KBotCommand[], firstCategory: string, secondCategory: string): 1 | -1 | 0 {
    if (firstCategory > secondCategory) return 1;
    if (secondCategory > firstCategory) return -1;
    return 0;
}

@ApplyOptions<ChatInputCommand.Options>({
    description: 'Make a poll with or without a time limit.',
})
export class HelpCommand extends KBotCommand {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, { ...options });
    }

    public override registerApplicationCommands(registry: ChatInputCommand.Registry) {
        registry.registerChatInputCommand(
            (builder) => builder
                    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
                    .setName('help')
                    .setDescription(this.description),
            {
                idHints: super.getIdHints(this.name),
                guildIds: super.getGuildIds(),
            },
        );
    }

    public async chatInputRun(interaction: Command.ChatInputInteraction) {
        await interaction.deferReply();
        const avatar = interaction.client.user!.avatarURL();
        return this.display(interaction, avatar!);
    }

    private async display(interaction: ChatInputCommand.Interaction, avatar: string) {
        const display = await this.createDisplay(avatar);
        await display.run(interaction, interaction.user);
        return interaction;
    }

    private async createDisplay(avatar: string) {
        const commandsByCategory = await HelpCommand.getCommands();

        const display = new PaginatedMessage({
            template: new MessageEmbed().setColor(embedColors.default),
        })
            .setSelectMenuOptions((pageIndex) => ({ label: commandsByCategory.keyAt(pageIndex - 1)! }));

        display.addPageEmbed((embed) => embed
                .setAuthor({ name: 'Bot info', iconURL: avatar })
                .addFields(
                    { name: 'Dashboard', value: 'https://kbot.ca/', inline: true },
                    { name: 'Documentation', value: 'https://docs.kbot.ca', inline: true },
                    { name: 'Support server', value: 'https://discord.gg/4bXGu4Gf4c' },
                    { name: 'Command identifiers', value: '**[S]** - Slash command\n**[C]** - Context menu command (Right-click -> Apps)' },
));

        for (const [category, commands] of commandsByCategory) {
            if (commands.length) {
                display.addPageEmbed((embed) => embed
                    .setAuthor({ name: `${category} commands`, iconURL: avatar })
                    .setDescription(commands.map(this.formatCommand).join('\n')));
}
        }
        return display;
    }

    private formatCommand(command: KBotCommand) {
        return `**${command.supportsChatInputCommands() ? '[S]' : '[C]'} ${command.name}**\n${command.detailedDescription}`;
    }

    private static async getCommands() {
        const commands = container.stores.get('commands');
        const filtered = new Collection<string, KBotCommand[]>();
        filtered.set('Bot info', []);
        await Promise.all(
            commands.map(async (cmd) => {
                const command = cmd as KBotCommand;
                const category = filtered.get(command.category!);
                if (category) category.push(command);
                else filtered.set(command.category!, [command as KBotCommand]);
            }),
        );
        return filtered.sort(sortCommandsAlphabetically);
    }
}
