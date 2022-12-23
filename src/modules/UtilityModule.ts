import { ChatInputModuleCommand, Module } from '@kbotdev/plugin-modules';
import { container } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import type { Guild } from 'discord.js';

@ApplyOptions<Module.Options>({
	fullName: 'Utility Module'
})
export class UtilityModule extends Module {
	private readonly service;

	public constructor(context: Module.Context, options: Module.Options) {
		super(context, { ...options });
		this.service = container.utility;
	}

	public async isEnabled(_command: ChatInputModuleCommand, guild: Guild): Promise<boolean> {
		return this.service.repo.isEnabled(guild.id);
	}
}

declare module '@kbotdev/plugin-modules' {
	interface Modules {
		UtilityModule: never;
	}
}
