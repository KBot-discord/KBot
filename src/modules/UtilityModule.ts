import { UtilitySettingsRepository } from '#repositories';
import { PollSubmodule } from '#submodules';
import { Module } from '@kbotdev/plugin-modules';
import { ApplyOptions } from '@sapphire/decorators';
import { isNullish } from '@sapphire/utilities';
import type { IsEnabledContext } from '@kbotdev/plugin-modules';
import type { UtilitySettings } from '#prisma';
import type { UpsertUtilitySettingsData } from '#types/repositories';

@ApplyOptions<Module.Options>({
	fullName: 'Utility Module'
})
export class UtilityModule extends Module {
	public readonly polls: PollSubmodule;

	private readonly repository: UtilitySettingsRepository;

	public constructor(context: Module.Context, options: Module.Options) {
		super(context, { ...options });

		this.polls = new PollSubmodule();

		this.repository = new UtilitySettingsRepository();

		this.container.utility = this;
	}

	public async isEnabled({ guild }: IsEnabledContext): Promise<boolean> {
		if (isNullish(guild)) return false;
		const settings = await this.getSettings(guild.id);
		return isNullish(settings) ? false : settings.enabled;
	}

	public async getSettings(guildId: string): Promise<UtilitySettings | null> {
		return this.repository.findOne({ guildId });
	}

	public async upsertSettings(guildId: string, data: UpsertUtilitySettingsData): Promise<UtilitySettings> {
		return this.repository.upsert({ guildId }, data);
	}

	public async fetchIncidentChannels() {
		return this.repository.findManyWithIncidentChannel();
	}
}

declare module '@kbotdev/plugin-modules' {
	interface Modules {
		UtilityModule: never;
	}
}
