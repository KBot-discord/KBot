import { Collection, MessageEmbed } from 'discord.js';
import { Command, container, type ChatInputCommand } from '@sapphire/framework';
import { PaginatedMessage } from '@sapphire/discord.js-utilities';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { ApplyOptions } from '@sapphire/decorators';
import { EmbedColors } from '../../lib/util/constants';
import { getGuildIds } from '../../lib/util/config';

function sortCommandsAlphabetically(_: Command[], __: Command[], firstCategory: string, secondCategory: string): 1 | -1 | 0 {
	if (firstCategory > secondCategory) return 1;
	if (secondCategory > firstCategory) return -1;
	return 0;
}

@ApplyOptions<ChatInputCommand.Options>({
	description: 'Make a poll with or without a time limit.',
	preconditions: ['GuildOnly']
})
export class HelpCommand extends Command {
	public constructor(context: ChatInputCommand.Context, options: ChatInputCommand.Options) {
		super(context, { ...options });
		if (Boolean(this.description) && !this.detailedDescription) this.detailedDescription = this.description;
	}

	public override registerApplicationCommands(registry: ChatInputCommand.Registry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder //
					.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
					.setName('help')
					.setDescription(this.description),
			{
				idHints: ['1036723541049085993'],
				guildIds: getGuildIds()
			}
		);
	}

	public async chatInputRun(interaction: ChatInputCommand.Interaction) {
		await interaction.deferReply();
		const avatar = interaction.client.user!.displayAvatarURL();
		const display = await this.createDisplay(avatar);
		await display.run(interaction, interaction.user);
		return interaction;
	}

	private async createDisplay(avatar: string) {
		const commandsByCategory = await HelpCommand.getCommands();

		const display = new PaginatedMessage({
			template: new MessageEmbed().setColor(EmbedColors.Default)
		}).setSelectMenuOptions((pageIndex) => ({ label: commandsByCategory.keyAt(pageIndex - 1)! }));

		display.addPageEmbed((embed) =>
			embed
				.setAuthor({ name: 'Bot info', iconURL: avatar })
				.addFields(
					{ name: 'Dashboard', value: 'https://kbot.ca/', inline: true },
					{ name: 'Documentation', value: 'https://docs.kbot.ca', inline: true },
					{ name: 'Support server', value: 'https://discord.gg/4bXGu4Gf4c' },
					{ name: 'Command identifiers', value: '**[S]** - Slash command\n**[C]** - Context menu command (Right-click -> Apps)' }
				)
		);

		for (const [category, commands] of commandsByCategory) {
			if (commands.length) {
				display.addPageEmbed((embed) =>
					embed
						.setAuthor({ name: `${category} commands`, iconURL: avatar })
						.setDescription(commands.map((c) => this.formatCommand(c)).join('\n'))
				);
			}
		}
		return display;
	}

	private formatCommand(command: Command) {
		return `**${command.supportsChatInputCommands() ? '[S]' : '[C]'} ${command.name}**\n${command.detailedDescription}`;
	}

	private static async getCommands() {
		const commands = container.stores.get('commands');
		const filtered = new Collection<string, Command[]>();
		filtered.set('Bot info', []);
		await Promise.all(
			commands.map((cmd) => {
				const command = cmd as Command;
				const category = filtered.get(command.category!);
				if (category) return category.push(command);
				return filtered.set(command.category!, [command as Command]);
			})
		);
		return filtered.sort(sortCommandsAlphabetically);
	}
}
