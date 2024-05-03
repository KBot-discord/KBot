import { ChannelPermissionsError } from '../../lib/structures/errors/ChannelPermissionsError.js';
import { KBotErrors } from '../../lib/types/Enums.js';
import { EmbedColors } from '../../lib/utilities/constants.js';
import { CreditCustomIds, CreditFields, CreditType } from '../../lib/utilities/customIds.js';
import { validCustomId } from '../../lib/utilities/decorators.js';
import { buildCustomId, fetchChannel, getResourceFromType, parseCustomId } from '../../lib/utilities/discord.js';
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ModalSubmitInteraction } from 'discord.js';
import { messageLink } from '@discordjs/builders';
import { isNullOrUndefined } from '@sapphire/utilities';
import type { APIEmbedField, GuildTextBasedChannel } from 'discord.js';
import type { Credit, CreditModal } from '../../lib/types/CustomIds.js';

@ApplyOptions<InteractionHandler.Options>({
	name: CreditCustomIds.ResourceModalCreate,
	interactionHandlerType: InteractionHandlerTypes.ModalSubmit
})
export class ModalHandler extends InteractionHandler {
	public override async run(
		interaction: ModalSubmitInteraction<'cached'>,
		{ channelId, resource, type, source, description, artist }: InteractionHandler.ParseResult<this>
	): Promise<void> {
		const fields: APIEmbedField[] = [];
		if (source) fields.push({ name: 'Image source', value: source });
		if (description) fields.push({ name: 'Description', value: description });
		if (artist) fields.push({ name: 'Artist', value: artist });

		const creditsChannel = await fetchChannel<GuildTextBasedChannel>(channelId);
		if (isNullOrUndefined(creditsChannel)) {
			return void interaction.errorReply("The current credits channel doesn't exist. Please set a new one with `/credits set`");
		}

		const { result } = await this.container.validator.channels.canSendEmbeds(creditsChannel);
		if (!result) {
			return void interaction.client.emit(KBotErrors.ChannelPermissions, {
				interaction,
				error: new ChannelPermissionsError()
			});
		}

		const message = await creditsChannel.send({
			embeds: [
				new EmbedBuilder()
					.setColor(EmbedColors.Default)
					.setTitle(resource.name!)
					.setThumbnail(resource.url)
					.addFields(fields)
					.setFooter({
						text: `${type === CreditType.Emote ? 'Emote' : 'Sticker'} ID: ${resource.id}`
					})
			],
			components: [
				new ActionRowBuilder<ButtonBuilder>().addComponents([
					new ButtonBuilder()
						.setCustomId(buildCustomId<Credit>(CreditCustomIds.ResourceEdit, { ri: resource.id!, t: type }))
						.setLabel('Edit info')
						.setStyle(ButtonStyle.Secondary),
					new ButtonBuilder()
						.setCustomId(
							buildCustomId<Credit>(CreditCustomIds.ResourceRefresh, {
								ri: resource.id!,
								t: type
							})
						)
						.setLabel('Refresh name')
						.setStyle(ButtonStyle.Secondary)
				])
			]
		});

		await interaction.successReply(`[Credits sent](${messageLink(message.channelId, message.id)})`);
	}

	@validCustomId(CreditCustomIds.ResourceModalCreate)
	public override async parse(interaction: ModalSubmitInteraction<'cached'>) {
		const settings = await this.container.utility.settings.get(interaction.guildId);
		if (isNullOrUndefined(settings) || !settings.enabled) {
			await interaction.errorReply(`The module for this feature is disabled.\nYou can run \`/utility toggle\` to enable it.`);
			return this.none();
		}

		await interaction.deferReply({ ephemeral: true });

		const {
			data: { c, ri, t }
		} = parseCustomId<CreditModal>(interaction.customId);

		const resource = getResourceFromType(interaction.guildId, ri, t);
		if (!resource) {
			await interaction.defaultFollowup(`That ${t === CreditType.Emote ? 'emote' : 'sticker'} has been deleted.`, {
				ephemeral: true
			});
			return this.none();
		}

		const source = interaction.fields.getTextInputValue(CreditFields.Source);
		const description = interaction.fields.getTextInputValue(CreditFields.Description);
		const artist = interaction.fields.getTextInputValue(CreditFields.Artist);

		return this.some({ channelId: c, resource, type: t, source, description, artist });
	}
}
