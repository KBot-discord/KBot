import { ApplyOptions } from '@sapphire/decorators';
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import type { ApplicationCommandOptionChoiceData } from 'discord.js';
import { KBotCommand } from '../../lib/extensions/KBotCommand.js';
import type { KBotSubcommand } from '../../lib/extensions/KBotSubcommand.js';
import { KBotModules } from '../../lib/types/Enums.js';
import { EmbedColors } from '../../lib/utilities/constants.js';
import { getUserAvatarUrl } from '../../lib/utilities/discord.js';
import type { CoreModule } from '../../modules/CoreModule.js';

@ApplyOptions<KBotCommand.Options>({
	module: KBotModules.Core,
	description: "Get info about the bot and all of it's commands.",
	helpEmbed: (builder) => {
		return builder //
			.setName('help')
			.setOption({ label: '/help [command]' });
	},
})
export class CoreCommand extends KBotCommand<CoreModule> {
	public override registerApplicationCommands(registry: KBotCommand.Registry): void {
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
							.setRequired(false),
					),
			{
				idHints: [],
				guildIds: [],
			},
		);
	}

	public override async autocompleteRun(interaction: KBotCommand.AutocompleteInteraction): Promise<void> {
		const search = interaction.options.getString('command', true);
		const result = await this.container.meili.get('commands', search);

		const options: ApplicationCommandOptionChoiceData[] = result.hits.map(({ name }) => ({
			name,
			value: name,
		}));

		await interaction.respond(options);
	}

	public override async chatInputRun(interaction: KBotCommand.ChatInputCommandInteraction): Promise<unknown> {
		await interaction.deferReply();
		const option = interaction.options.getString('command');

		if (option) {
			return await this.chatInputCommand(interaction, option);
		}

		return await this.chatInputInfo(interaction);
	}

	public async chatInputInfo(interaction: KBotCommand.ChatInputCommandInteraction): Promise<unknown> {
		return await interaction.editReply({
			embeds: [
				new EmbedBuilder()
					.setColor(EmbedColors.Default)
					.setAuthor({ name: 'Bot info', iconURL: getUserAvatarUrl(interaction.client.user) })
					.setDescription('For info about commands, you can run `/help command`')
					.addFields(
						{ name: 'Dashboard', value: 'https://kbot.ca/' },
						{ name: 'Documentation', value: 'https://docs.kbot.ca' },
						{ name: 'Donations', value: 'https://ko-fi.com/killbasa' },
						{ name: 'Support server', value: 'https://discord.gg/4bXGu4Gf4c' },
					),
			],
		});
	}

	public async chatInputCommand(
		interaction: KBotCommand.ChatInputCommandInteraction,
		option: string,
	): Promise<unknown> {
		const command = this.container.stores.get('commands').get(option) as
			| KBotCommand<never>
			| KBotSubcommand<never>
			| undefined;
		if (!command) {
			return await interaction.errorReply('That command does not exist.');
		}

		return await interaction.editReply({
			embeds: [command.helpEmbed],
		});
	}
}
