import { Precondition } from '@sapphire/framework';
import type { CommandInteraction } from 'discord.js';

export class BotOwnerPrecondition extends Precondition {
	public chatInputRun(interaction: CommandInteraction) {
		return this.container.config.discord.ownerIds.includes(interaction.user.id)
			? this.ok()
			: this.error({ message: "you don't have the right, O you don't have the right" });
	}
}

declare module '@sapphire/framework' {
	interface Preconditions {
		BotOwner: never;
	}
}
