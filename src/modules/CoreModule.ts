import { CoreSettingsRepository } from '#repositories/core/CoreSettingsRepository';
import { Module } from '@kbotdev/plugin-modules';
import { ApplyOptions } from '@sapphire/decorators';
import type { UpsertCoreSettingsData } from '#types/repositories';

@ApplyOptions<Module.Options>({
	fullName: 'Core Module'
})
export class CoreModule extends Module {
	private readonly repository: CoreSettingsRepository;

	public constructor(context: Module.Context, options: Module.Options) {
		super(context, { ...options });

		this.repository = new CoreSettingsRepository();

		this.container.core = this;
	}

	public async getSettings(guildId: string) {
		return this.repository.findOne(
			{ guildId } //
		);
	}

	public async upsertSettings(guildId: string, data: UpsertCoreSettingsData = {}) {
		return this.repository.upsert(
			{ guildId }, //
			data
		);
	}

	public async deleteSettings(guildId: string) {
		return this.repository.delete(
			{ guildId } //
		);
	}
}

declare module '@kbotdev/plugin-modules' {
	interface Modules {
		CoreModule: never;
	}
}
