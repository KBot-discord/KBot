import { PollService, UtilitySettingsService } from '#services/utility';
import { AddEmoteCustomIds, AddEmoteFields, buildCustomId } from '#utils/customIds';
import { Module } from '@kbotdev/plugin-modules';
import { ApplyOptions } from '@sapphire/decorators';
import { isNullish } from '@sapphire/utilities';
import { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import type { IsEnabledContext } from '@kbotdev/plugin-modules';
import type { UtilitySettings } from '#prisma';
import type { UpsertUtilitySettingsData } from '#types/database';
import type { EmoteCreditModal } from '#types/CustomIds';

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
		const settings = await this.getSettings(guild.id).catch(() => null);
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

	public buildEmoteCreditModal(channelId: string, emoteId: string): ModalBuilder {
		return new ModalBuilder()
			.setCustomId(
				buildCustomId<EmoteCreditModal>(AddEmoteCustomIds.ModalCredits, {
					c: channelId,
					ei: emoteId
				})
			)
			.setTitle('Add a credit for an emote')
			.addComponents(
				new ActionRowBuilder<TextInputBuilder>().addComponents(
					new TextInputBuilder()
						.setCustomId(AddEmoteFields.CreditLink)
						.setLabel('Source link')
						.setStyle(TextInputStyle.Short)
						.setMinLength(1)
						.setMaxLength(100)
						.setRequired(true)
				),
				new ActionRowBuilder<TextInputBuilder>().addComponents(
					new TextInputBuilder()
						.setCustomId(AddEmoteFields.CreditDescription)
						.setLabel('Description')
						.setStyle(TextInputStyle.Short)
						.setMinLength(0)
						.setMaxLength(100)
				),
				new ActionRowBuilder<TextInputBuilder>().addComponents(
					new TextInputBuilder()
						.setCustomId(AddEmoteFields.CreditArtistName)
						.setLabel("Artist's name")
						.setStyle(TextInputStyle.Short)
						.setMinLength(0)
						.setMaxLength(100)
				),
				new ActionRowBuilder<TextInputBuilder>().addComponents(
					new TextInputBuilder()
						.setCustomId(AddEmoteFields.CreditArtistLink)
						.setLabel("Artist's profile")
						.setStyle(TextInputStyle.Short)
						.setMinLength(0)
						.setMaxLength(100)
				)
			);
	}
}

declare module '@kbotdev/plugin-modules' {
	interface Modules {
		UtilityModule: never;
	}
}
