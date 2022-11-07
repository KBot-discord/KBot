// Imports
import { Command, type ChatInputCommand } from '@sapphire/framework';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { ApplyOptions } from '@sapphire/decorators';
import { MessageEmbed } from 'discord.js';
import { embedColors } from '../../lib/util/constants';
import { getGuildIds, getIdHints } from '../../lib/util/config';

@ApplyOptions<ChatInputCommand.Options>({
	description: 'Show information about command permissions.'
})
export class PermissionsCommand extends Command {
	public constructor(context: ChatInputCommand.Context, options: ChatInputCommand.Options) {
		super(context, { ...options });
	}

	public override registerApplicationCommands(registry: ChatInputCommand.Registry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder //
					.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
					.setName('permissions')
					.setDescription(this.description),
			{ idHints: getIdHints(this.name), guildIds: getGuildIds() }
		);
	}

	public async chatInputRun(interaction: ChatInputCommand.Interaction) {
		return interaction.reply({
			embeds: [
				new MessageEmbed().setColor(embedColors.default)
					.setDescription(`To edit command permissions go to \`\`Server Settings -> Integrations -> KBot -> Manage\`\`.
                    The new system works the same as role, category, and channel permissions.
                    Any changes made to the permissions will override the defaults below.
                    
                    More info: <https://discord.com/blog/slash-commands-permissions-discord-apps-bots>
    
                    __**Command Permission Defaults:**__
                    Work in progress`)
			]
		});
	}
}