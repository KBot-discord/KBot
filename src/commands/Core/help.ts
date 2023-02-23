import { EmbedColors } from '#utils/constants';
import { Collection, EmbedBuilder } from 'discord.js';
import { container } from '@sapphire/framework';
import { PaginatedMessage } from '@sapphire/discord.js-utilities';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { ApplyOptions } from '@sapphire/decorators';
import { ModuleCommand } from '@kbotdev/plugin-modules';
import type { CoreModule } from '#modules/CoreModule';
import type { Command } from '@sapphire/framework';

@ApplyOptions<ModuleCommand.Options>({
	module: 'CoreModule',
	description: "Get info about the bot and all of it's commands.",
	requiredClientPermissions: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks],
	deferOptions: {
		defer: true
	}
})
export class CoreCommand extends ModuleCommand<CoreModule> {
	public constructor(context: ModuleCommand.Context, options: ModuleCommand.Options) {
		super(context, { ...options });
		if (Boolean(this.description) && !this.detailedDescription) this.detailedDescription = this.description;
	}

	public override registerApplicationCommands(registry: ModuleCommand.Registry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder //
					.setName('help')
					.setDescription(this.description)
					.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
					.setDMPermission(true),
			{
				idHints: [],
				guildIds: this.container.config.discord.devServers
			}
		);
	}

	public async chatInputRun(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
		const avatar = interaction.client.user!.displayAvatarURL();
		const display = await this.createDisplay(avatar);
		await display.run(interaction, interaction.user);
		return interaction;
	}

	private async createDisplay(avatar: string) {
		const commandsByCategory = await CoreCommand.getCommands();

		const display = new PaginatedMessage({
			template: new EmbedBuilder().setColor(EmbedColors.Default)
		}).setSelectMenuOptions((pageIndex) => ({ label: commandsByCategory.keyAt(pageIndex - 1)! }));

		display.addPageEmbed((embed) =>
			embed
				.setAuthor({ name: 'Bot info', iconURL: avatar })
				.addFields(
					{ name: 'Dashboard', value: 'https://kbot.ca/', inline: true },
					{ name: 'Documentation', value: 'https://docs.kbot.ca', inline: true },
					{ name: 'Donations', value: 'https://ko-fi.com/killbasa', inline: true },
					{ name: 'Support server', value: 'https://discord.gg/4bXGu4Gf4c' },
					{ name: 'Command identifiers', value: '**[S]** - Slash command\n**[C]** - Context menu command' }
				)
		);

		for (const [category, commands] of commandsByCategory) {
			if (commands.length) {
				display.addPageEmbed((embed) =>
					embed
						.setAuthor({ name: `${category} commands`, iconURL: avatar })
						.setDescription(
							commands
								.map((cmd) => `**${cmd.supportsChatInputCommands() ? '[S]' : '[C]'} ${cmd.name}**\n${cmd.detailedDescription}`)
								.join('\n')
						)
				);
			}
		}
		return display;
	}

	private static getCommands() {
		const commands = container.stores.get('commands');
		const filteredCommands = new Collection<string, Command[]>();

		filteredCommands.set('Bot info', []);

		commands.map((command) => {
			const category = filteredCommands.get(command.category!);
			if (category) return category.push(command);
			return filteredCommands.set(command.category!, [command]);
		});

		return filteredCommands.sort((_: Command[], __: Command[], firstCategory: string, secondCategory: string) => {
			if (firstCategory > secondCategory) return 1;
			if (secondCategory > firstCategory) return -1;
			return 0;
		});
	}
}
