// Imports
import type { InteractionCollector, Message, MessageActionRow, MessageComponentInteraction, MessageEmbed } from 'discord.js';
import type { Subcommand } from '@sapphire/plugin-subcommands';
import type { Command } from '@sapphire/framework';
import { MenuControl } from '../types/enums';

export abstract class BaseMenu {
	protected reply: Message | null = null;
	protected collector: InteractionCollector<MessageComponentInteraction> | null = null;
	protected pages: { embeds: MessageEmbed[]; components: MessageActionRow[] }[] | null = null;

	protected readonly interaction: Subcommand.ChatInputInteraction;

	public constructor(interaction: Command.ChatInputInteraction) {
		this.interaction = interaction;
	}

	protected async handleArrow(interaction: MessageComponentInteraction, direction: MenuControl, currentPosition: number) {
		if (direction === MenuControl.Stop) return this.handleStop(interaction);
		await interaction.deferUpdate();
		this.collector!.resetTimer();

		let newPage;
		if (direction === MenuControl.First) {
			newPage = 0;
		} else if (direction === MenuControl.Previous) {
			newPage = currentPosition > 0 ? currentPosition - 1 : 0;
		} else if (direction === MenuControl.Next) {
			newPage = currentPosition < this.pages!.length - 1 ? currentPosition + 1 : currentPosition;
		} else {
			newPage = this.pages!.length - 1;
		}
		await this.interaction.editReply(this.pages![newPage]);
	}

	protected async handleStop(interaction: MessageComponentInteraction, auto?: boolean) {
		if (!auto) this.collector!.stop();
		await this.interaction.editReply({ embeds: interaction.message.embeds, components: [] });
	}

	protected async showMenu() {
		return this.interaction.editReply(this.pages![0]);
	}
}
