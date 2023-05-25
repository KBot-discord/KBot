import { EmbedColors } from '#utils/constants';
import { getUserAvatarUrl } from '#utils/discord';
import { KBotCommand } from '#extensions/KBotCommand';
import { EmbedBuilder } from 'discord.js';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { ApplyOptions } from '@sapphire/decorators';
import type { ApplicationCommandOptionChoiceData } from 'discord.js';
import type { CoreModule } from '#modules/CoreModule';
import type { DocumentCommand } from '#types/Meili';

@ApplyOptions<KBotCommand.Options>({
	module: 'CoreModule',
	description: "Get info about the bot and all of it's commands.",
	helpEmbed: (builder) => {
		return builder //
			.setName('help')
			.setOptions({ label: '/help [command]' });
	}
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
							.setRequired(false)
					),
			{
				idHints: [],
				guildIds: []
			}
		);
	}

	public override async autocompleteRun(interaction: KBotCommand.AutocompleteInteraction): Promise<void> {
		const search = interaction.options.getString('command', true);
		const result = await this.container.meili.get<DocumentCommand>('commands', search);

		const options: ApplicationCommandOptionChoiceData[] = result.hits.map(({ name }) => ({
			name,
			value: name
		}));

		return interaction.respond(options);
	}

	public override async chatInputRun(interaction: KBotCommand.ChatInputCommandInteraction): Promise<unknown> {
		await interaction.deferReply();
		const option = interaction.options.getString('command');

		if (option) {
			return this.chatInputCommand(interaction, option);
		}

		return this.chatInputInfo(interaction);
	}

	public async chatInputInfo(interaction: KBotCommand.ChatInputCommandInteraction): Promise<unknown> {
		return interaction.editReply({
			embeds: [
				new EmbedBuilder()
					.setColor(EmbedColors.Default)
					.setAuthor({ name: 'Bot info', iconURL: getUserAvatarUrl(interaction.client.user) })
					.setDescription('For info about commands, you can run `/help command`')
					.addFields(
						{ name: 'Dashboard', value: 'https://kbot.ca/' },
						{ name: 'Documentation', value: 'https://docs.kbot.ca' },
						{ name: 'Donations', value: 'https://ko-fi.com/killbasa' },
						{ name: 'Support server', value: 'https://discord.gg/4bXGu4Gf4c' }
					)
			]
		});
	}

	public async chatInputCommand(interaction: KBotCommand.ChatInputCommandInteraction, option: string): Promise<unknown> {
		const command = this.container.stores.get('commands').get(option) as KBotCommand<any> | undefined;
		if (!command) {
			return interaction.errorReply('That command does not exist.');
		}

		return interaction.editReply({
			embeds: [command.helpEmbed]
		});
	}
}
