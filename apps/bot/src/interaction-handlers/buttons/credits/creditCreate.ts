import { CreditCustomIds, parseCustomId, CreditType } from '#utils/customIds';
import { interactionRatelimit, validCustomId } from '#utils/decorators';
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { Time } from '@sapphire/duration';
import { ButtonInteraction } from 'discord.js';
import type { Credit } from '#types/CustomIds';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.Button
})
export class ButtonHandler extends InteractionHandler {
	public override async run(interaction: ButtonInteraction<'cached'>, { channelId, emoteId }: InteractionHandler.ParseResult<this>) {
		const modal = this.container.utility.buildCreditModal(channelId, emoteId, CreditType.Emote);
		return interaction.showModal(modal);
	}

	@validCustomId(CreditCustomIds.Create)
	@interactionRatelimit(Time.Second * 30, 5)
	public override async parse(interaction: ButtonInteraction<'cached'>) {
		if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageGuildExpressions)) {
			await interaction.errorReply('You need the `Manage Emojis And Stickers` permission to use this.', true);
			return this.none();
		}

		const settings = await this.container.utility.getSettings(interaction.guildId);
		if (isNullish(settings) || !settings.enabled) {
			await interaction.errorReply(`The module for this feature is disabled.\nYou can run \`/utility toggle\` to enable it.`, true);
			return this.none();
		}

		if (isNullish(settings.creditsChannelId)) {
			await interaction.defaultReply('There is no channel set up for credits. You can set one with `/credits set`.', true);
			return this.none();
		}

		const {
			data: { ri }
		} = parseCustomId<Credit>(interaction.customId);

		return this.some({ channelId: settings.creditsChannelId, emoteId: ri });
	}
}
