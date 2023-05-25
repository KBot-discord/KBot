import { EventSettingsService, KaraokeService } from '#services';
import { isNullOrUndefined } from '#utils/functions';
import { Module } from '@kbotdev/plugin-modules';
import { ApplyOptions } from '@sapphire/decorators';
import type { IsEnabledContext } from '@kbotdev/plugin-modules';

@ApplyOptions<Module.Options>({
	fullName: 'Event Module'
})
export class EventModule extends Module {
	public readonly settings: EventSettingsService;
	public readonly karaoke: KaraokeService;

	public constructor(context: Module.Context, options: Module.Options) {
		super(context, options);

		this.settings = new EventSettingsService();
		this.karaoke = new KaraokeService();

		this.container.events = this;
	}

	public override async isEnabled({ guild }: IsEnabledContext): Promise<boolean> {
		if (isNullOrUndefined(guild)) return false;
		const settings = await this.settings.get(guild.id);
		return isNullOrUndefined(settings) ? false : settings.enabled;
	}
}

declare module '@kbotdev/plugin-modules' {
	// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
	interface Modules {
		EventModule: never;
	}
}
