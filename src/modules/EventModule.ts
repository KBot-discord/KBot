import { EventSettingsRepository } from '#repositories';
import { KaraokeSubmodule } from '#submodules';
import { Module } from '@kbotdev/plugin-modules';
import { ApplyOptions } from '@sapphire/decorators';
import { isNullish } from '@sapphire/utilities';
import type { IsEnabledContext } from '@kbotdev/plugin-modules';
import type { UpsertEventSettingsData } from '#types/repositories';

@ApplyOptions<Module.Options>({
	fullName: 'Event Module'
})
export class EventModule extends Module {
	public readonly karaoke: KaraokeSubmodule;

	private readonly repository: EventSettingsRepository;

	public constructor(context: Module.Context, options: Module.Options) {
		super(context, { ...options });

		this.karaoke = new KaraokeSubmodule();
		this.repository = new EventSettingsRepository();

		this.container.events = this;
	}

	public async isEnabled({ guild }: IsEnabledContext): Promise<boolean> {
		if (isNullish(guild)) return false;
		const settings = await this.getSettings(guild.id);
		return isNullish(settings) ? false : settings.enabled;
	}

	public async getSettings(guildId: string) {
		return this.repository.findOne({ guildId });
	}

	public async upsertSettings(guildId: string, data: UpsertEventSettingsData) {
		return this.repository.upsert({ guildId }, data);
	}
}

declare module '@kbotdev/plugin-modules' {
	interface Modules {
		EventModule: never;
	}
}
