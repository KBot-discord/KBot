import { ApplyOptions } from '@sapphire/decorators';
import { Precondition } from '@sapphire/framework';
import type { PreconditionOptions, PreconditionResult } from '@sapphire/framework';
import type { CommandInteraction } from 'discord.js';

@ApplyOptions<PreconditionOptions>({
	name: 'BotOwner'
})
export class BotOwnerPrecondition extends Precondition {
	public override chatInputRun(interaction: CommandInteraction): PreconditionResult {
		return this.container.config.discord.ownerIds.includes(interaction.user.id)
			? this.ok()
			: this.error({ message: "you don't have the right, O you don't have the right" });
	}
}

declare module '@sapphire/framework' {
	// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
	interface Preconditions {
		BotOwner: never;
	}
}
