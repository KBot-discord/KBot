import { ChatInputModuleCommand, Module } from '@kbotdev/plugin-modules';
import { container } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import type { Guild } from 'discord.js';

export class ModerationModule extends Module {
	private readonly db;

	public constructor(context: Module.Context, options: Module.Options) {
		super(context, { ...options });
		this.db = container.db.moderationModule;
	}

	public async isEnabled(_command: ChatInputModuleCommand, guild: Guild): Promise<boolean> {
		const result = await this.db.findUnique({ where: { id: guild.id } });
		if (isNullish(result)) return false;
		return result.moduleEnabled;
	}
}

declare module '@kbotdev/plugin-modules' {
	interface Modules {
		ModerationModule: never;
	}
}
