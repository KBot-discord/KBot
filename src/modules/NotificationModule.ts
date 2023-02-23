import { NotificationSettingsRepository } from '#repositories';
import { TwitterSubmodule, TwitchSubmodule, YoutubeSubmodule } from '#submodules';
import { Module } from '@kbotdev/plugin-modules';
import { ApplyOptions } from '@sapphire/decorators';
import { isNullish } from '@sapphire/utilities';
import type { UpsertNotificationSettingsData } from '#types/repositories';
import type { IsEnabledContext } from '@kbotdev/plugin-modules';

@ApplyOptions<Module.Options>({
	fullName: 'Notification Module'
})
export class NotificationModule extends Module {
	public readonly twitch: TwitchSubmodule;
	public readonly twitter: TwitterSubmodule;
	public readonly youtube: YoutubeSubmodule;

	private readonly repository: NotificationSettingsRepository;

	public constructor(context: Module.Context, options: Module.Options) {
		super(context, { ...options });

		this.twitch = new TwitchSubmodule();
		this.twitter = new TwitterSubmodule();
		this.youtube = new YoutubeSubmodule();

		this.repository = new NotificationSettingsRepository();

		this.container.notifications = this;
	}

	public async isEnabled({ guild }: IsEnabledContext): Promise<boolean> {
		if (isNullish(guild)) return false;
		const settings = await this.getSettings(guild.id);
		return isNullish(settings) ? false : settings.enabled;
	}

	public async getSettings(guildId: string) {
		return this.repository.findOne({ guildId });
	}

	public async upsertSettings(guildId: string, data: UpsertNotificationSettingsData) {
		return this.repository.upsert({ guildId }, data);
	}

	public async deleteSettings(guildId: string): Promise<void> {
		await Promise.all([
			await this.twitter.deleteGuild(guildId), //
			await this.youtube.deleteGuild(guildId)
		]);
	}
}

declare module '@kbotdev/plugin-modules' {
	interface Modules {
		NotificationModule: never;
	}
}
