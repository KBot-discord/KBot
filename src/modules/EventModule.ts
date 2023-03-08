import { EventSettingsService, KaraokeService } from '#services/events';
import { Module } from '@kbotdev/plugin-modules';
import { ApplyOptions } from '@sapphire/decorators';
import { isNullish } from '@sapphire/utilities';
import type { IsEnabledContext } from '@kbotdev/plugin-modules';
import type { UpsertEventSettingsData } from '#types/database';

@ApplyOptions<Module.Options>({
	fullName: 'Event Module'
})
export class EventModule extends Module {
	public readonly settings: EventSettingsService;
	public readonly karaoke: KaraokeService;

	public constructor(context: Module.Context, options: Module.Options) {
		super(context, { ...options });

		this.settings = new EventSettingsService();
		this.karaoke = new KaraokeService();

		this.container.events = this;
	}

	public async isEnabled({ guild }: IsEnabledContext): Promise<boolean> {
		if (isNullish(guild)) return false;
		const settings = await this.getSettings(guild.id);
		return isNullish(settings) ? false : settings.enabled;
	}

	public async getSettings(guildId: string) {
		return this.settings.get({ guildId });
	}

	public async upsertSettings(guildId: string, data: UpsertEventSettingsData) {
		return this.settings.upsert({ guildId }, data);
	}
}

declare module '@kbotdev/plugin-modules' {
	interface Modules {
		EventModule: never;
	}
}
