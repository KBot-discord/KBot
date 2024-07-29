import { Module } from '@kbotdev/plugin-modules';
import type { IsEnabledContext } from '@kbotdev/plugin-modules';
import { ApplyOptions } from '@sapphire/decorators';
import { isNullOrUndefined } from '@sapphire/utilities';
import { EmbedBuilder, channelMention } from 'discord.js';
import { EventSettingsService } from '../lib/services/EventSettingsService.js';
import { KaraokeService } from '../lib/services/KaraokeService.js';
import { KBotModules } from '../lib/types/Enums.js';
import { EmbedColors } from '../lib/utilities/constants.js';

@ApplyOptions<Module.Options>({
	name: KBotModules.Events,
	fullName: 'Event Module',
})
export class EventModule extends Module {
	public readonly settings: EventSettingsService;
	public readonly karaoke: KaraokeService;

	public constructor(context: Module.LoaderContext, options: Module.Options) {
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

	public karaokeInstructionsEmbed(eventId: string, embed = new EmbedBuilder()): EmbedBuilder {
		return embed
			.setColor(EmbedColors.Default) //
			.addFields(
				{ name: '**Voice channel:** ', value: channelMention(eventId) },
				{ name: '**Text channel:** ', value: channelMention(eventId), inline: true },
				{
					name: '**Instructions:**',
					value: [
						'**1.** Join the karaoke queue by running the `/karaoke join` slash command.',
						'**2.** Once your turn comes up, you will be invited to become a speaker on the stage.',
						'**3.** After singing, you can either leave the stage by muting your mic, clicking the "Move to audience" button, leaving the stage, or running the `/karaoke leave` slash command.',
					].join('\n'),
				},
			);
	}
}

declare module '@kbotdev/plugin-modules' {
	interface Modules {
		[KBotModules.Events]: never;
	}
}
