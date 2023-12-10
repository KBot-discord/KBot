import { DiscordIncidentService, PollService, UtilitySettingsService } from '#lib/services';
import { buildCustomId } from '#lib/utilities/discord';
import { isNullOrUndefined } from '#lib/utilities/functions';
import { CreditCustomIds, CreditFields } from '#lib/utilities/customIds';
import { Module } from '@kbotdev/plugin-modules';
import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';
import { Time } from '@sapphire/duration';
import type { CreditType } from '#lib/utilities/customIds';
import type { CreditImageModal, CreditModal, EmojiData, StickerData } from '#lib/types/CustomIds';
import type { IsEnabledContext } from '@kbotdev/plugin-modules';
import type { KBotModules } from '#lib/types/Enums';

@ApplyOptions<Module.Options>({
	fullName: 'Utility Module'
})
export class UtilityModule extends Module {
	public readonly settings: UtilitySettingsService;
	public readonly incidents: DiscordIncidentService;
	public readonly polls: PollService;

	public constructor(context: Module.LoaderContext, options: Module.Options) {
		super(context, options);

		this.settings = new UtilitySettingsService();
		this.incidents = new DiscordIncidentService();
		this.polls = new PollService();

		this.container.utility = this;
	}

	public override async isEnabled({ guild }: IsEnabledContext): Promise<boolean> {
		if (isNullOrUndefined(guild)) return false;
		const settings = await this.settings.get(guild.id).catch(() => null);
		return isNullOrUndefined(settings) ? false : settings.enabled;
	}

	/**
	 * Persist `Add emote` or `Add sticker` data between modal submissions.
	 * @param messageId - The ID of the message
	 * @param userId - The ID of the user
	 * @param data - The data to set to the cache
	 */
	public async setResourceCache(messageId: string, userId: string, data: EmojiData | StickerData): Promise<void> {
		await this.container.redis.setEx(this.resourceKey(messageId, userId), data, Time.Hour);
	}

	/**
	 * Get and delete data from the cache.
	 * @param messageId - The ID of the message
	 * @param userId - The ID of the user
	 */
	public async getAndDeleteResourceCache<T = EmojiData | StickerData>(messageId: string, userId: string): Promise<T | null> {
		const result = await this.container.redis.get(this.resourceKey(messageId, userId));
		if (result) await this.container.redis.del(this.resourceKey(messageId, userId));
		return result as T;
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

	private readonly resourceKey = (messageId: string, userId: string): string => `add-resource:${messageId}:${userId}`;
}

declare module '@kbotdev/plugin-modules' {
	// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
	interface Modules {
		[KBotModules.Utility]: never;
	}
}
