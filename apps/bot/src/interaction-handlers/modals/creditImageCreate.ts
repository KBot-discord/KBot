import { EmbedColors } from '#utils/constants';
import { CreditCustomIds, CreditFields } from '#utils/customIds';
import { validCustomId } from '#utils/decorators';
import { KBotErrors } from '#types/Enums';
import { ChannelPermissionsError } from '#structures/errors/ChannelPermissionsError';
import { isNullOrUndefined, parseCustomId } from '#utils/functions';
import { fetchChannel } from '#utils/discord';
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ModalSubmitInteraction } from 'discord.js';
import { messageLink } from '@discordjs/builders';
import type { CreditImageModal } from '#types/CustomIds';
import type { APIEmbedField, GuildTextBasedChannel } from 'discord.js';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.ModalSubmit
})
export class ModalHandler extends InteractionHandler {
	public override async run(
		interaction: ModalSubmitInteraction<'cached'>,
		{ channelId, name, link, source, description, artist }: InteractionHandler.ParseResult<this>
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
				new EmbedBuilder() //
					.setColor(EmbedColors.Default)
					.setTitle(name)
					.setImage(link)
					.addFields(fields)
			],
			components: [
				new ActionRowBuilder<ButtonBuilder>().addComponents([
					new ButtonBuilder() //
						.setCustomId(CreditCustomIds.ImageEdit)
						.setLabel('Edit info')
						.setStyle(ButtonStyle.Secondary)
				])
			]
		});

		await interaction.defaultReply(`[Credits sent](${messageLink(message.channelId, message.id)})`);
	}

	@validCustomId(CreditCustomIds.ImageModalCreate)
	public override async parse(interaction: ModalSubmitInteraction<'cached'>) {
		const settings = await this.container.utility.settings.get(interaction.guildId);
		if (isNullOrUndefined(settings) || !settings.enabled) {
			await interaction.errorReply(`The module for this feature is disabled.\nYou can run \`/utility toggle\` to enable it.`);
			return this.none();
		}

		await interaction.deferReply({ ephemeral: true });

		const {
			data: { c }
		} = parseCustomId<CreditImageModal>(interaction.customId);

		const name = interaction.fields.getTextInputValue(CreditFields.Name);
		const link = interaction.fields.getTextInputValue(CreditFields.Link);
		const source = interaction.fields.getTextInputValue(CreditFields.Source);
		const description = interaction.fields.getTextInputValue(CreditFields.Description);
		const artist = interaction.fields.getTextInputValue(CreditFields.Artist);

		if (!link.startsWith('https://')) {
			await interaction.errorReply(`Invalid image URL. The URL must start with \`https://\``);
			return this.none();
		}

		return this.some({ channelId: c, name, link, source, description, artist });
	}
}
