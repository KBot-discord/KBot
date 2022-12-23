import { Command, type ChatInputCommand } from '@sapphire/framework';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { ApplyOptions } from '@sapphire/decorators';
import { MessageEmbed } from 'discord.js';
import { EmbedColors } from '../../lib/util/constants';
import { getGuildIds } from '../../lib/util/config';

@ApplyOptions<ChatInputCommand.Options>({
	description: 'Show information about command permissions.',
	preconditions: ['GuildOnly'],
	requiredClientPermissions: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks]
})
export class PermissionsCommand extends Command {
	public constructor(context: ChatInputCommand.Context, options: ChatInputCommand.Options) {
		super(context, { ...options });
		if (Boolean(this.description) && !this.detailedDescription) this.detailedDescription = this.description;
	}

	public override registerApplicationCommands(registry: ChatInputCommand.Registry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder //
					.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
					.setName('permissions')
					.setDescription(this.description),
			{
				idHints: ['1038259858895552532'],
				guildIds: getGuildIds()
			}
		);
	}

	public async chatInputRun(interaction: ChatInputCommand.Interaction) {
		return interaction.reply({
			embeds: [
				new MessageEmbed().setColor(EmbedColors.Default)
					.setDescription(`To edit command permissions go to \`\`Server Settings -> Integrations -> KBot -> Manage\`\`.
                    The new system works the same as role, category, and channel permissions.
                    Any changes made to the permissions will override the defaults below.

                    More info: https://docs.kbot.ca/permission-defaults`)
			]
		});
	}
}
