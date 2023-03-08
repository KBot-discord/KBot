import { PollService, UtilitySettingsService } from '#services/utility';
import { Module } from '@kbotdev/plugin-modules';
import { ApplyOptions } from '@sapphire/decorators';
import { isNullish } from '@sapphire/utilities';
import type { IsEnabledContext } from '@kbotdev/plugin-modules';
import type { UtilitySettings } from '#prisma';
import type { UpsertUtilitySettingsData } from '#types/database';

@ApplyOptions<Module.Options>({
	fullName: 'Utility Module'
})
export class UtilityModule extends Module {
	public readonly settings: UtilitySettingsService;
	public readonly polls: PollService;

	public constructor(context: Module.Context, options: Module.Options) {
		super(context, { ...options });

		this.settings = new UtilitySettingsService();
		this.polls = new PollService();

		this.container.utility = this;
	}

	public async isEnabled({ guild }: IsEnabledContext): Promise<boolean> {
		if (isNullish(guild)) return false;
		const settings = await this.getSettings(guild.id);
		return isNullish(settings) ? false : settings.enabled;
	}

	public async getSettings(guildId: string): Promise<UtilitySettings | null> {
		return this.settings.get({ guildId });
	}

	public async upsertSettings(guildId: string, data: UpsertUtilitySettingsData): Promise<UtilitySettings> {
		return this.settings.upsert({ guildId }, data);
	}

	public async fetchIncidentChannels() {
		return this.settings.getIncidentChannels();
	}
}

declare module '@kbotdev/plugin-modules' {
	interface Modules {
		UtilityModule: never;
	}
}
