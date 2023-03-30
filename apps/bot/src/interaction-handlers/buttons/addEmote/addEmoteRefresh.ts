import { AddEmoteCustomIds, parseCustomId } from '#utils/customIds';
import { interactionRatelimit, validCustomId } from '#utils/decorators';
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { EmbedBuilder, ButtonInteraction } from 'discord.js';
import { Time } from '@sapphire/duration';
import type { EmoteCredit } from '#types/CustomIds';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.Button
})
export class ButtonHandler extends InteractionHandler {
	public override async run(interaction: ButtonInteraction<'cached'>, { emoji }: InteractionHandler.ParseResult<this>) {
		try {
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

	@validCustomId(AddEmoteCustomIds.Refresh)
	@interactionRatelimit(Time.Second * 10, 1)
	public override async parse(interaction: ButtonInteraction<'cached'>) {
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

		const emoji = interaction.guild.emojis.cache.get(ei);
		if (!emoji) {
			await interaction.defaultFollowup('That emote has been deleted.', true);
			return this.none();
		}

		if (interaction.message.embeds[0].title === emoji.name) {
			return this.none();
		}

		return this.some({ emoji });
	}
}
