import { ModerationAction } from '#structures/ModerationAction';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { ApplyOptions } from '@sapphire/decorators';
import { ModuleCommand } from '@kbotdev/plugin-modules';
import { isNullish } from '@sapphire/utilities';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import type { ApplicationCommandOptionChoiceData } from 'discord.js';
import type { ModerationModule } from '#modules/ModerationModule';

@ApplyOptions<ModuleCommand.Options>({
	module: 'ModerationModule',
	description: 'Unmute a user.',
	preconditions: ['ModuleEnabled'],
	requiredClientPermissions: [PermissionFlagsBits.ManageRoles, PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks],
	runIn: [CommandOptionsRunTypeEnum.GuildAny],
	deferOptions: {
		defer: true
	}
})
export class ModerationCommand extends ModuleCommand<ModerationModule> {
	public constructor(context: ModuleCommand.Context, options: ModuleCommand.Options) {
		super(context, { ...options });
		if (Boolean(this.description) && !this.detailedDescription) this.detailedDescription = this.description;
	}

	public disabledMessage = (moduleFullName: string): string => {
		return `[${moduleFullName}] The module for this command is disabled.\nYou can run \`/moderation toggle\` to enable it.`;
	};

	public override registerApplicationCommands(registry: ModuleCommand.Registry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder //
					.setName('unmute')
					.setDescription(this.description)
					.setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
					.setDMPermission(false)
					.addStringOption((option) =>
						option //
							.setName('user')
							.setDescription('Select a user to unmute')
							.setAutocomplete(true)
							.setRequired(true)
					)
					.addStringOption((option) =>
						option //
							.setName('reason')
							.setDescription('The reason for the unmute. (default: "No reason provided.")')
							.setRequired(false)
					)
					.addBooleanOption((option) =>
						option //
							.setName('dm')
							.setDescription('If the user should be messaged with the reason. (default: true)')
							.setRequired(false)
					)
					.addBooleanOption((option) =>
						option
							.setName('silent')
							.setDescription('True: unmute will not show in logs, False: unmute will show in logs. (default: false)')
							.setRequired(false)
					),
			{
				idHints: [],
				guildIds: this.container.config.discord.devServers
			}
		);
	}

	public override async autocompleteRun(interaction: ModuleCommand.AutocompleteInteraction<'cached'>): Promise<void> {
		const muteEntries = await this.module.mutes.getByGuild({ guildId: interaction.guildId });
		if (muteEntries.length === 0) return interaction.respond([]);

		const userData = await Promise.all(muteEntries.map(({ id }) => interaction.guild.members.fetch(id)));

		const userOptions: ApplicationCommandOptionChoiceData[] = userData //
			.filter((e) => !isNullish(e))
			.map((user) => ({ name: user!.displayName, value: user!.id }));

		return interaction.respond(userOptions);
	}

	public async chatInputRun(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
		const userId = interaction.options.getString('user', true);

		const member = await interaction.guild.members.fetch(userId);

		if (isNullish(member)) {
			return interaction.errorReply('You cannot unmute a user that is not in the server.');
		}

		const settings = await this.module.getSettings(interaction.guildId);
		if (isNullish(settings) || isNullish(settings.muteRoleId)) {
			return interaction.errorReply("Something went wrong when fetching this server's settings.");
		}

		const muted = await this.module.mutes.isMuted(member, settings.muteRoleId);
		if (!muted) {
			return interaction.errorReply('That user is not muted.');
		}

		const reason = interaction.options.getString('reason');
		const sendDm = interaction.options.getBoolean('dm');
		const silent = interaction.options.getBoolean('silent');

		return new ModerationAction(settings, interaction.member) //
			.unmute(member, { reason, sendDm, silent });
	}
}
