import { getGuildIds } from '#utils/config';
import { EmbedColors } from '#utils/constants';
import { ApplicationCommandType, PermissionFlagsBits } from 'discord-api-types/v10';
import { ApplyOptions } from '@sapphire/decorators';
import axios from 'axios';
import translate from 'deepl';
import { EmbedBuilder } from 'discord.js';
import { Command } from '@sapphire/framework';
import * as url from 'url';

@ApplyOptions<Command.Options>({
	detailedDescription: 'Translate a message. Only the person running the command can see the result.',
	preconditions: ['GuildOnly'],
	requiredClientPermissions: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks]
})
export class UtilityCommand extends Command {
	public constructor(context: Command.Context, options: Command.Options) {
		super(context, { ...options });
		if (Boolean(this.description) && !this.detailedDescription) this.detailedDescription = this.description;
	}

	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerContextMenuCommand(
			(builder) =>
				builder //
					.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
					.setName('Translate')
					.setType(ApplicationCommandType.Message),
			{ idHints: ['1059986611389091910'], guildIds: getGuildIds() }
		);
	}

	public async contextMenuRun(interaction: Command.ContextMenuCommandInteraction) {
		await interaction.deferReply({ ephemeral: true });
		const { key } = this.container.config.deepl;
		const message = await interaction.channel!.messages.fetch(interaction.targetId);

		const params = new url.URLSearchParams({ auth_key: key });
		const chars = await axios.post('https://api-free.deepl.com/v2/usage', params.toString());

		if (chars.data.character_count > 495000) {
			return interaction.errorReply('Monthly translate limit reached.');
		}

		const tl = await translate({
			free_api: true,
			text: `${message}`,
			target_lang: 'EN-GB',
			auth_key: key
		});

		return interaction.editReply({
			embeds: [
				new EmbedBuilder()
					.setColor(EmbedColors.Default)
					.setAuthor({ name: `From ${tl.data.translations[0].detected_source_language} to EN` })
					.setDescription(`${tl.data.translations[0].text}`)
			]
		});
	}
}
