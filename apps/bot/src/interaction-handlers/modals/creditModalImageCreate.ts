import { EmbedColors } from '#utils/constants';
import { CreditCustomIds, CreditFields } from '#utils/customIds';
import { validCustomId } from '#utils/decorators';
import { KBotErrors } from '#types/Enums';
import { ChannelPermissionsError } from '#structures/errors/ChannelPermissionsError';
import { isNullOrUndefined, parseCustomId } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ModalSubmitInteraction } from 'discord.js';
import { messageLink } from '@discordjs/builders';
import type { CreditImageModal } from '#types/CustomIds';
import type { GuildTextBasedChannel } from 'discord.js';
import type { APIEmbedField } from 'discord-api-types/v10';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.ModalSubmit
})
export class ModalHandler extends InteractionHandler {
	public override async run(
		modal: ModalSubmitInteraction<'cached'>,
		{ channelId, name, link, source, description, artist }: InteractionHandler.ParseResult<this>
	): Promise<void> {
		const fields: APIEmbedField[] = [];
		if (source) fields.push({ name: 'Image source', value: source });
		if (description) fields.push({ name: 'Description', value: description });
		if (artist) fields.push({ name: 'Artist', value: artist });

		const creditsChannel = (await modal.guild.channels.fetch(channelId)) as GuildTextBasedChannel | null;
		if (isNullOrUndefined(creditsChannel)) {
			return void modal.errorReply("The current credits channel doesn't exist. Please set a new one with `/credits set`");
		}

		const { result } = await this.container.validator.channels.canSendEmbeds(creditsChannel);
		if (!result) {
			return void modal.client.emit(KBotErrors.ChannelPermissions, {
				interaction: modal,
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

		await modal.defaultReply(`[Credits sent](${messageLink(message.channelId, message.id)})`);
	}

	@validCustomId(CreditCustomIds.ImageModalCreate)
	// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
	public override async parse(modal: ModalSubmitInteraction) {
		if (!modal.inCachedGuild()) {
			return this.none();
		}

		const settings = await this.container.utility.settings.get(modal.guildId);
		if (isNullOrUndefined(settings) || !settings.enabled) {
			await modal.errorReply(`The module for this feature is disabled.\nYou can run \`/utility toggle\` to enable it.`);
			return this.none();
		}

		await modal.deferReply({ ephemeral: true });

		const {
			data: { c }
		} = parseCustomId<CreditImageModal>(modal.customId);

		const name = modal.fields.getTextInputValue(CreditFields.Name);
		const link = modal.fields.getTextInputValue(CreditFields.Link);
		const source = modal.fields.getTextInputValue(CreditFields.Source);
		const description = modal.fields.getTextInputValue(CreditFields.Description);
		const artist = modal.fields.getTextInputValue(CreditFields.Artist);

		if (!link.startsWith('https://')) {
			await modal.errorReply(`Invalid image URL. The URL must start with \`https://\``);
			return this.none();
		}

		return this.some({ channelId: c, name, link, source, description, artist });
	}
}
