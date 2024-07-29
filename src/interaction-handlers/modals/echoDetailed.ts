import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { EmbedBuilder, type ModalSubmitInteraction, roleMention } from 'discord.js';
import type { GuildTextBasedChannel } from 'discord.js';
import type { EchoModal } from '../../lib/types/CustomIds.js';
import { EmbedColors } from '../../lib/utilities/constants.js';
import { EchoCustomIds, EchoFields } from '../../lib/utilities/customIds.js';
import { validCustomId } from '../../lib/utilities/decorators.js';
import { fetchChannel, parseCustomId } from '../../lib/utilities/discord.js';

@ApplyOptions<InteractionHandler.Options>({
	name: EchoCustomIds.Detailed,
	interactionHandlerType: InteractionHandlerTypes.ModalSubmit,
})
export class ModalHandler extends InteractionHandler {
	public override async run(
		interaction: ModalSubmitInteraction<'cached'>,
		{ role, channel, text }: InteractionHandler.ParseResult<this>,
	): Promise<void> {
		const sentMessage = await channel.send({
			content: role ? `${roleMention(role.id)} ${text}` : text,
			allowedMentions: { roles: role ? [role.id] : [] },
		});

		await interaction.editReply({
			embeds: [
				new EmbedBuilder() //
					.setColor(EmbedColors.Success)
					.setDescription(`[Message sent](${sentMessage.url})`),
			],
		});
	}

	@validCustomId(EchoCustomIds.Detailed)
	public override async parse(interaction: ModalSubmitInteraction<'cached'>) {
		await interaction.deferReply();

		const {
			data: { role: roleId, channel: channelId },
		} = parseCustomId<EchoModal>(interaction.customId);

		const role = roleId ? await interaction.guild.roles.fetch(roleId) : null;
		const channel = await fetchChannel<GuildTextBasedChannel>(channelId);

		const text = interaction.fields.getTextInputValue(EchoFields.Text);

		return this.some({ role, channel: channel!, text });
	}
}
