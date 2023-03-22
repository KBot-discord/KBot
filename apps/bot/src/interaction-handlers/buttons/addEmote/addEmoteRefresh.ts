import { AddEmoteCustomIds, parseCustomId } from '#utils/customIds';
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { EmbedBuilder } from 'discord.js';
import type { ButtonInteraction } from 'discord.js';
import type { EmoteCredit } from '#types/CustomIds';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.Button
})
export class ButtonHandler extends InteractionHandler {
	private readonly customIds = [AddEmoteCustomIds.Refresh];

	public override async run(interaction: ButtonInteraction<'cached'>, { emoteId }: InteractionHandler.ParseResult<this>) {
		try {
			const emoji = await interaction.guild.emojis.fetch(emoteId);

			const embed = interaction.message.embeds[0];
			const updatedEmbed: EmbedBuilder = EmbedBuilder.from(embed);

			updatedEmbed.setTitle(emoji.name!);

			await interaction.message.edit({
				embeds: [updatedEmbed]
			});
		} catch (err) {
			return this.container.logger.error(err);
		}
	}

	public override async parse(interaction: ButtonInteraction<'cached'>) {
		if (!this.customIds.some((id) => interaction.customId.startsWith(id))) return this.none();

		if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageEmojisAndStickers)) {
			await interaction.errorReply('You need the `Manage Emojis And Stickers` permission to use this.', true);
			return this.none();
		}

		const settings = await this.container.utility.getSettings(interaction.guildId);
		if (isNullish(settings) || !settings.enabled) {
			await interaction.errorReply(`The module for this feature is disabled.\nYou can run \`/utility toggle\` to enable it.`, true);
			return this.none();
		}

		await interaction.deferUpdate();

		const {
			data: { ei }
		} = parseCustomId<EmoteCredit>(interaction.customId);

		return this.some({ emoteId: ei });
	}
}
