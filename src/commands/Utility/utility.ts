import { Subcommand } from '@sapphire/plugin-subcommands';
import { ApplyOptions } from '@sapphire/decorators';
import { getGuildIds } from '../../lib/util/config';
import { MessageEmbed } from 'discord.js';
import { EmbedColors } from '../../lib/util/constants';
import { channelMention } from '@discordjs/builders';

@ApplyOptions<Subcommand.Options>({
	description: 'Utility module config',
	preconditions: ['GuildOnly'],
	subcommands: [{ name: 'config', chatInputRun: 'chatInputConfig' }]
})
export class DiscordStatusCommand extends Subcommand {
	public constructor(context: Subcommand.Context, options: Subcommand.Options) {
		super(context, { ...options });
		if (Boolean(this.description) && !this.detailedDescription) this.detailedDescription = this.description;
	}

	public override registerApplicationCommands(registry: Subcommand.Registry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder //
					.setName('utility')
					.setDescription('Show the current utility module configuration')
					.addSubcommand((subcommand) =>
						subcommand //
							.setName('config')
							.setDescription('Show the current config')
					),
			{ idHints: ['1040515910433263706'], guildIds: getGuildIds() }
		);
	}

	public async chatInputConfig(interaction: Subcommand.ChatInputInteraction) {
		await interaction.deferReply();
		const { db } = this.container;

		const [config, eventCount, pollCount] = await db.$transaction([
			db.utilityModule.findUnique({ where: { id: interaction.guildId! } }),
			db.event.count({ where: { guildId: interaction.guildId! } }),
			db.poll.count({ where: { guildId: interaction.guildId! } })
		]);

		return interaction.editReply({
			embeds: [
				new MessageEmbed()
					.setColor(EmbedColors.Default)
					.setAuthor({ name: 'Utility module config', iconURL: interaction.guild!.iconURL()! })
					.addFields([
						{ name: 'Module enabled', value: `${config?.moduleEnabled ?? false}` },
						{
							name: 'Discord status channel',
							value: `${config?.incidentChannel ? channelMention(config.incidentChannel) : 'No channel set'}`,
							inline: true
						},
						{
							name: 'Emote credits channel',
							value: `${config?.creditsChannel ? channelMention(config.creditsChannel) : 'No channel set'}`,
							inline: true
						},
						{ name: '# of events', value: `${eventCount}`, inline: true },
						{ name: '# of polls', value: `${pollCount}`, inline: true }
					])
			]
		});
	}
}
