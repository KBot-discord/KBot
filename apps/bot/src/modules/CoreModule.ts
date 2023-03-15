import { CoreSettingsService } from '#services/core';
import { Module } from '@kbotdev/plugin-modules';
import { ApplyOptions } from '@sapphire/decorators';
import type { UpsertCoreSettingsData } from '#types/database';

@ApplyOptions<Module.Options>({
	fullName: 'Core Module'
})
export class CoreModule extends Module {
	public readonly settings: CoreSettingsService;

	public constructor(context: Module.Context, options: Module.Options) {
		super(context, { ...options });

		this.settings = new CoreSettingsService();

		this.container.core = this;
	}

	public async getSettings(guildId: string) {
		return this.settings.get(
			{ guildId } //
		);
	}

	public async upsertSettings(guildId: string, data: UpsertCoreSettingsData = {}) {
		return this.settings.upsert(
			{ guildId }, //
			data
		);
	}

	public async deleteSettings(guildId: string) {
		return this.settings.delete(
			{ guildId } //
		);
	}
}

declare module '@kbotdev/plugin-modules' {
	interface Modules {
		CoreModule: never;
	}
}
