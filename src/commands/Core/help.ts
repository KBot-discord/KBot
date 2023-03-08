import { EmbedColors } from '#utils/constants';
import { EmbedBuilder } from 'discord.js';
import { PaginatedMessage } from '@sapphire/discord.js-utilities';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { ApplyOptions } from '@sapphire/decorators';
import { ModuleCommand } from '@kbotdev/plugin-modules';
import type { ApplicationCommandOptionChoiceData } from 'discord.js';
import type { CoreModule } from '#modules/CoreModule';

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
					.setDMPermission(true)
					.addStringOption((option) =>
						option //
							.setName('command')
							.setDescription('Get info about a specific command.')
							.setAutocomplete(true)
							.setRequired(false)
					),
			{
				idHints: [],
				guildIds: this.container.config.discord.devServers
			}
		);
	}

	public override async autocompleteRun(interaction: ModuleCommand.AutocompleteInteraction<'cached'>): Promise<void> {
		const search = interaction.options.getString('command', true);
		const result = await this.container.meili.get('commands', search);

		const options: ApplicationCommandOptionChoiceData[] = result.hits.map(({ name }) => ({ name, value: name }));

		return interaction.respond(options);
	}

	public async chatInputRun(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
		await interaction.deferReply();
		const option = interaction.options.getString('command');
		if (option) {
			return this.displayCommandInfo(interaction, option);
		}

		const avatar = interaction.client.user!.displayAvatarURL();
		const modules = this.container.stores.get('modules');

		const display = new PaginatedMessage({
			template: new EmbedBuilder().setColor(EmbedColors.Default)
		}).setSelectMenuOptions((pageIndex) => ({ label: modules.keyAt(pageIndex - 1)! }));

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

		for (const { commands } of modules.values()) {
			if (commands.size) {
				display.addPageEmbed((embed) =>
					embed
						.setAuthor({ name: `${module} commands`, iconURL: avatar })
						.setDescription(
							commands
								.map((cmd) => `**${cmd.supportsChatInputCommands() ? '[S]' : '[C]'} ${cmd.name}**\n${cmd.detailedDescription}`)
								.join('\n')
						)
				);
			}
		}

		await display.run(interaction, interaction.user);
	}

	public async displayCommandInfo(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>, option: string) {
		const command = this.container.stores.get('commands').get(option);
		if (!command) {
			return interaction.errorReply('That command does not exist.');
		}

		const description = (command.detailedDescription ?? command.description) as string;

		return interaction.editReply({
			embeds: [
				new EmbedBuilder() //
					.setColor(EmbedColors.Default)
					.setTitle(command.name)
					.setDescription(description)
			]
		});
	}
}
