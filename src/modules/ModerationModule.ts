import { Module, ModuleCommandInteractionUnion, ModuleCommandUnion } from '@kbotdev/plugin-modules';
import { container } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import type { Guild } from 'discord.js';

@ApplyOptions<Module.Options>({
	fullName: 'Moderation Module'
})
export class ModerationModule extends Module {
	public readonly service;

	public constructor(context: Module.Context, options: Module.Options) {
		super(context, { ...options });
		this.service = container.moderation;
	}

	public async isEnabled(guild: Guild, _interaction: ModuleCommandInteractionUnion, _command: ModuleCommandUnion): Promise<boolean> {
		return this.service.repo.isEnabled(guild.id);
	}
}

declare module '@kbotdev/plugin-modules' {
	interface Modules {
		ModerationModule: never;
	}
}
