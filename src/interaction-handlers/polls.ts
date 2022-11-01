// Imports
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';

// Types
import type { ButtonInteraction } from 'discord.js';
import { MessageEmbed } from 'discord.js';
import { embedColors } from '../lib/util/constants';


const enum PollIdKeyVal {
    Category = 'category',
    Message = 'message',
    Option = 'option',
}

@ApplyOptions<InteractionHandler.Options>({
    interactionHandlerType: InteractionHandlerTypes.Button,
})
export class ButtonHandler extends InteractionHandler {
    public override async run(interaction: ButtonInteraction, result: InteractionHandler.ParseResult<this>) {
        return interaction.editReply({
            embeds: [
                new MessageEmbed()
                    .setColor(embedColors.success)
                    .setDescription(`Vote added to option ${result.selectedOption + 1}\n(only the latest vote counts)`),
            ],
        });
    }

    public override async parse(interaction: ButtonInteraction) {
        const { category, message, option } = this.parseCustomId(interaction.customId);
        if (category !== 'poll') return this.none();

        await interaction.deferReply({ ephemeral: true });
        return this.some({ messageId: message, selectedOption: parseInt(option, 10) });
    }

    private parseCustomId(customId: string): Record<PollIdKeyVal, string> {
        const result: Record<PollIdKeyVal, string> = { category: '', message: '', option: '' };
        const entries = customId.split(';');
        for (const entry of entries) {
            const { 0: key, 1: val } = entry.split(':');
            result[key as PollIdKeyVal] = val;
        }
        return result;
    }
}
