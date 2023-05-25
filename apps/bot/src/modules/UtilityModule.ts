import { PollService, UtilitySettingsService } from '#services';
import { CreditCustomIds, CreditFields } from '#utils/customIds';
import { buildCustomId, isNullOrUndefined } from '#utils/functions';
import { Module } from '@kbotdev/plugin-modules';
import { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';
import type { CreditType } from '#utils/customIds';
import type { CreditImageModal, CreditModal } from '#types/CustomIds';
import type { IsEnabledContext } from '@kbotdev/plugin-modules';

@ApplyOptions<Module.Options>({
	fullName: 'Utility Module'
})
export class UtilityModule extends Module {
	public readonly settings: UtilitySettingsService;
	public readonly polls: PollService;

	public constructor(context: Module.Context, options: Module.Options) {
		super(context, options);

		this.settings = new UtilitySettingsService();
		this.polls = new PollService();

		this.container.utility = this;
	}

	public override async isEnabled({ guild }: IsEnabledContext): Promise<boolean> {
		if (isNullOrUndefined(guild)) return false;
		const settings = await this.settings.get(guild.id).catch(() => null);
		return isNullOrUndefined(settings) ? false : settings.enabled;
	}

	public async fetchIncidentChannels(): Promise<{ guildId: string; channelId: string }[]> {
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
					.setRequired(isNullOrUndefined(resourceId))
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
	// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
	interface Modules {
		UtilityModule: never;
	}
}
