import { EchoCustomIds, EchoFields } from '#utils/customIds';
import { validCustomId } from '#utils/decorators';
import { parseCustomId } from '#utils/functions';
import { fetchChannel } from '#utils/discord';
import { EmbedColors } from '#utils/constants';
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { EmbedBuilder, ModalSubmitInteraction, roleMention } from 'discord.js';
import type { GuildTextBasedChannel } from 'discord.js';
import type { EchoModal } from '#types/CustomIds';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.ModalSubmit
})
export class ModalHandler extends InteractionHandler {
	public override async run(
		interaction: ModalSubmitInteraction<'cached'>,
		{ role, channel, text }: InteractionHandler.ParseResult<this>
	): Promise<void> {
		const sentMessage = await channel.send({
			content: role ? `${roleMention(role.id)} ${text}` : text,
			allowedMentions: { roles: role ? [role.id] : [] }
		});

		await interaction.editReply({
			embeds: [
				new EmbedBuilder() //
					.setColor(EmbedColors.Success)
					.setDescription(`[Message sent](${sentMessage.url})`)
			]
		});
	}

	@validCustomId(EchoCustomIds.Detailed)
	public override async parse(interaction: ModalSubmitInteraction<'cached'>) {
		await interaction.deferReply();

		const {
			data: { role: roleId, channel: channelId }
		} = parseCustomId<EchoModal>(interaction.customId);

		const role = roleId ? await interaction.guild.roles.fetch(roleId) : null;
		const channel = await fetchChannel<GuildTextBasedChannel>(channelId);

		const text = interaction.fields.getTextInputValue(EchoFields.Text);

		return this.some({ role, channel: channel!, text });
	}
}
