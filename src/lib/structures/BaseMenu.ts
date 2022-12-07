import { InteractionCollector, Message, MessageActionRow, MessageComponentInteraction, MessageEmbed, MessageButton } from 'discord.js';
import { ArrowCustomId, MenuControl } from '../types/enums';
import { buildKey } from '../util/keys';
import { ArrowEmojis } from '../util/constants';

import type { Subcommand } from '@sapphire/plugin-subcommands';
import type { Command } from '@sapphire/framework';

export interface IArrowCustomId {
	dir: MenuControl;
	index: number;
}

export abstract class BaseMenu {
	protected readonly interaction: Subcommand.ChatInputInteraction;

	protected reply: Message | null = null;
	protected collector: InteractionCollector<MessageComponentInteraction> | null = null;
	protected pages: { embeds: MessageEmbed[]; components: MessageActionRow[] }[] | null = null;

	public constructor(interaction: Command.ChatInputInteraction) {
		this.interaction = interaction;
	}

	protected async handleArrow(interaction: MessageComponentInteraction, direction: MenuControl, currentPosition: number) {
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

	protected async handleStop(interaction: MessageComponentInteraction, auto = true) {
		if (!auto) this.collector!.stop();
		await this.interaction.editReply({ embeds: interaction.message.embeds, components: [] });
	}

	protected async showMenu() {
		return this.interaction.editReply(this.pages![0]);
	}

	protected buildArrowButtons(index: number): MessageActionRow {
		return new MessageActionRow().addComponents([
			new MessageButton()
				.setCustomId(buildKey<IArrowCustomId>(ArrowCustomId, { dir: MenuControl.First, index }))
				.setStyle('SECONDARY')
				.setEmoji(ArrowEmojis.Start),
			new MessageButton()
				.setCustomId(buildKey<IArrowCustomId>(ArrowCustomId, { dir: MenuControl.Previous, index }))
				.setStyle('SECONDARY')
				.setEmoji(ArrowEmojis.Previous),
			new MessageButton()
				.setCustomId(buildKey<IArrowCustomId>(ArrowCustomId, { dir: MenuControl.Next, index }))
				.setStyle('SECONDARY')
				.setEmoji(ArrowEmojis.Next),
			new MessageButton()
				.setCustomId(buildKey<IArrowCustomId>(ArrowCustomId, { dir: MenuControl.Last, index }))
				.setStyle('SECONDARY')
				.setEmoji(ArrowEmojis.Last),
			new MessageButton()
				.setCustomId(buildKey<IArrowCustomId>(ArrowCustomId, { dir: MenuControl.Stop, index }))
				.setStyle('DANGER')
				.setEmoji(ArrowEmojis.Stop)
		]);
	}
}
