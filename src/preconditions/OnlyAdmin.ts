// Imports
import { Precondition } from '@sapphire/framework';
import { Permissions } from 'discord.js';
import type { CommandInteraction } from 'discord.js';

export class OnlyAdminPrecondition extends Precondition {
	public chatInputRun(interaction: CommandInteraction) {
		return interaction.memberPermissions?.has(Permissions.FLAGS.ADMINISTRATOR) ? this.ok() : this.error();
	}
}

declare module '@sapphire/framework' {
	interface Preconditions {
		OnlyAdmin: never;
	}
}
