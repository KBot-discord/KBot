import { PollService, UtilitySettingsService } from '#services';
import { CreditCustomIds, CreditFields, buildCustomId } from '#utils/customIds';
import { Module } from '@kbotdev/plugin-modules';
import { ApplyOptions } from '@sapphire/decorators';
import { isNullish } from '@sapphire/utilities';
import { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import type { CreditType } from '#utils/customIds';
import type { CreditImageModal, CreditModal } from '#types/CustomIds';
import type { IsEnabledContext } from '@kbotdev/plugin-modules';
import type { UtilitySettings } from '@kbotdev/database';
import type { UpsertUtilitySettingsData } from '#types/database';

@ApplyOptions<Module.Options>({
	name: 'UtilityModule',
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

	public override async isEnabled({ guild }: IsEnabledContext): Promise<boolean> {
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

	public buildCreditModal(channelId: string, resourceId?: string, type?: CreditType): ModalBuilder {
		const customId =
			resourceId && type
				? buildCustomId<CreditModal>(CreditCustomIds.ResourceModalCreate, {
						c: channelId,
						ri: resourceId,
						t: type
				  })
				: buildCustomId<CreditImageModal>(CreditCustomIds.ImageModalCreate, {
						c: channelId
				  });

		const components: ActionRowBuilder<TextInputBuilder>[] = [
			new ActionRowBuilder<TextInputBuilder>().addComponents(
				new TextInputBuilder()
					.setCustomId(CreditFields.Source)
					.setLabel('The source of the image')
					.setStyle(TextInputStyle.Paragraph)
					.setMinLength(0)
					.setMaxLength(100)
					.setRequired(isNullish(resourceId))
			),
			new ActionRowBuilder<TextInputBuilder>().addComponents(
				new TextInputBuilder()
					.setCustomId(CreditFields.Description)
					.setLabel('The description of the credit entry')
					.setStyle(TextInputStyle.Paragraph)
					.setMinLength(0)
					.setMaxLength(100)
					.setRequired(false)
			),
			new ActionRowBuilder<TextInputBuilder>().addComponents(
				new TextInputBuilder()
					.setCustomId(CreditFields.Artist)
					.setLabel('The artist')
					.setStyle(TextInputStyle.Short)
					.setMinLength(0)
					.setMaxLength(100)
					.setRequired(false)
			)
		];

		if (!resourceId) {
			components.unshift(
				new ActionRowBuilder<TextInputBuilder>().addComponents(
					new TextInputBuilder()
						.setCustomId(CreditFields.Name)
						.setLabel('The title of the credit entry')
						.setStyle(TextInputStyle.Short)
						.setMinLength(0)
						.setMaxLength(50)
						.setRequired(true)
				),
				new ActionRowBuilder<TextInputBuilder>().addComponents(
					new TextInputBuilder()
						.setCustomId(CreditFields.Link)
						.setLabel('The link of the image')
						.setStyle(TextInputStyle.Paragraph)
						.setMinLength(0)
						.setMaxLength(100)
						.setRequired(true)
				)
			);
		}

		return new ModalBuilder() //
			.setCustomId(customId)
			.setTitle('Add a credit entry')
			.addComponents(components);
	}
}

declare module '@kbotdev/plugin-modules' {
	interface Modules {
		UtilityModule: never;
	}
}
