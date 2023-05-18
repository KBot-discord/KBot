import { EventSettingsService, KaraokeService } from '#services';
import { Module } from '@kbotdev/plugin-modules';
import { isNullish } from '@sapphire/utilities';
import type { IsEnabledContext } from '@kbotdev/plugin-modules';

export class EventModule extends Module {
	public readonly settings: EventSettingsService;
	public readonly karaoke: KaraokeService;

	public constructor(options?: Module.Options) {
		super({ ...options, fullName: 'Event Module' });

		this.settings = new EventSettingsService();
		this.karaoke = new KaraokeService();
	}

	public override async isEnabled({ guild }: IsEnabledContext): Promise<boolean> {
		if (isNullish(guild)) return false;
		const settings = await this.settings.get(guild.id);
		return isNullish(settings) ? false : settings.enabled;
	}
}
