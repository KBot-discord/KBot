import { KaraokeEventMenu } from '#lib/structures/menus/KaraokeEventMenu';
import { BlankSpace, EmbedColors, Emoji } from '#utils/constants';
import { getGuildIcon } from '#utils/Discord';
import { ApplyOptions } from '@sapphire/decorators';
import { ChannelType, PermissionFlagsBits } from 'discord-api-types/v10';
import { ModuleCommand } from '@kbotdev/plugin-modules';
import { isNullish } from '@sapphire/utilities';
import { channelMention, time, userMention } from '@discordjs/builders';
import { EmbedBuilder } from 'discord.js';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import type { GuildTextBasedChannel, StageChannel, VoiceChannel, GuildScheduledEvent } from 'discord.js';
import type { EventModule } from '#modules/EventModule';

@ApplyOptions<ModuleCommand.Options>({
	module: 'EventModule',
	description: 'Create, end, or manage events.',
	preconditions: ['ModuleEnabled'],
	requiredClientPermissions: [
		PermissionFlagsBits.ManageEvents,
		PermissionFlagsBits.MuteMembers,
		PermissionFlagsBits.MoveMembers,
		PermissionFlagsBits.ManageChannels,
		PermissionFlagsBits.SendMessages,
		PermissionFlagsBits.EmbedLinks
	],
	runIn: [CommandOptionsRunTypeEnum.GuildAny],
	deferOptions: {
		defer: true,
		ephemeral: true
	}
})
export class EventsCommand extends ModuleCommand<EventModule> {
	public constructor(context: ModuleCommand.Context, options: ModuleCommand.Options) {
		super(context, { ...options });
		if (Boolean(this.description) && !this.detailedDescription) this.detailedDescription = this.description;
	}

	public disabledMessage = (moduleFullName: string): string => {
		return `[${moduleFullName}] The module for this command is disabled.\nYou can run \`/events toggle\` to enable it.`;
	};

	public override registerApplicationCommands(registry: ModuleCommand.Registry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder //
					.setName('manage')
					.setDescription(this.description)
					.setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents)
					.setDMPermission(false)
					.addSubcommandGroup((group) =>
						group //
							.setName('karaoke')
							.setDescription('Manage karaoke events')
							.addSubcommand((subcommand) =>
								subcommand //
									.setName('start')
									.setDescription('Start a karaoke event')
									.addChannelOption((channel) =>
										channel
											.setName('voice_channel')
											.setDescription('The stage/voice channel for the karaoke event')
											.addChannelTypes(ChannelType.GuildStageVoice, ChannelType.GuildVoice)
											.setRequired(true)
									)
									.addChannelOption((chan) =>
										chan
											.setName('text_channel')
											.setDescription('The channel to show queue rotations and instructions')
											.addChannelTypes(ChannelType.GuildText, ChannelType.PublicThread, ChannelType.GuildForum)
											.setRequired(true)
									)
									.addStringOption((topic) =>
										topic
											.setName('topic')
											.setDescription('The name of the stage event (default: "Karaoke Event")')
											.setRequired(false)
									)
									.addRoleOption((role) =>
										role //
											.setName('role')
											.setDescription('The role to ping for the event')
											.setRequired(false)
									)
							)
							.addSubcommand((subcommand) =>
								subcommand //
									.setName('schedule')
									.setDescription('Schedule a karaoke event')
									.addStringOption((channel) =>
										channel
											.setName('discord_event')
											.setDescription('The Discord event that the karaoke event will be for.')
											.setAutocomplete(true)
											.setRequired(true)
									)
									.addChannelOption((chan) =>
										chan
											.setName('text_channel')
											.setDescription('The channel to show queue rotations and instructions')
											.addChannelTypes(ChannelType.GuildText, ChannelType.PublicThread, ChannelType.GuildForum)
											.setRequired(true)
									)
									.addRoleOption((role) =>
										role //
											.setName('role')
											.setDescription('The role to ping for the event')
											.setRequired(false)
									)
							)
							.addSubcommand((subcommand) =>
								subcommand //
									.setName('stop')
									.setDescription('Stop a karaoke event')
									.addStringOption((option) =>
										option //
											.setName('event')
											.setDescription('The event to stop')
											.setAutocomplete(true)
											.setRequired(true)
									)
							)
							.addSubcommand((subcommand) =>
								subcommand //
									.setName('add')
									.setDescription('Add a user to a karaoke queue')
									.addStringOption((option) =>
										option //
											.setName('event')
											.setDescription('The event to add the user to')
											.setAutocomplete(true)
											.setRequired(true)
									)
									.addUserOption((option) =>
										option //
											.setName('user')
											.setDescription('The user to add')
											.setRequired(true)
									)
							)
							.addSubcommand((subcommand) =>
								subcommand //
									.setName('remove')
									.setDescription('Remove a user to a karaoke queue')
									.addStringOption((option) =>
										option //
											.setName('event')
											.setDescription('The event to remove the user from')
											.setAutocomplete(true)
											.setRequired(true)
									)
									.addUserOption((option) =>
										option //
											.setName('user')
											.setDescription('The user to remove')
											.setRequired(true)
									)
							)
							.addSubcommand((subcommand) =>
								subcommand //
									.setName('menu')
									.setDescription('Open the menu to manage karaoke events')
							)
					),
			{
				idHints: [],
				guildIds: this.container.config.discord.devServers
			}
		);
	}

	public async chatInputRun(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
		switch (interaction.options.getSubcommandGroup(true)) {
			default: {
				switch (interaction.options.getSubcommand(true)) {
					case 'start': {
						return this.chatInputKaraokeStart(interaction);
					}
					case 'schedule': {
						return this.chatInputKaraokeSchedule(interaction);
					}
					case 'stop': {
						return this.chatInputKaraokeStop(interaction);
					}
					case 'add': {
						return this.chatInputKaraokeAdd(interaction);
					}
					case 'remove': {
						return this.chatInputKaraokeRemove(interaction);
					}
					default: {
						return this.chatInputKaraokeMenu(interaction);
					}
				}
			}
		}
	}

	public async chatInputKaraokeStart(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
		const voiceChannel = interaction.options.getChannel('voice_channel', true) as StageChannel | VoiceChannel;
		const textChannel = interaction.options.getChannel('text_channel', true) as GuildTextBasedChannel;
		const topic = interaction.options.getString('topic');
		const role = interaction.options.getRole('role');

		const exists = await this.module.karaoke.doesEventExist(interaction.guildId, voiceChannel.id);
		if (exists) {
			return interaction.defaultReply('There is already an event in that channel.');
		}

		await this.module.karaoke.startEvent(interaction.guild, voiceChannel, textChannel, topic, role?.id);

		return interaction.successReply('The karaoke event has started.');
	}

	public async chatInputKaraokeSchedule(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
		const discordEventId = interaction.options.getString('discord_event', true);
		const textChannel = interaction.options.getChannel('text_channel', true);
		const role = interaction.options.getRole('role');

		const discordEvent = (await interaction.guild.scheduledEvents.fetch(discordEventId)) as GuildScheduledEvent | undefined;
		if (isNullish(discordEvent)) {
			return interaction.errorReply('That is not a valid discord event.');
		}

		if (isNullish(discordEvent.channelId) || isNullish(discordEvent.channel)) {
			return interaction.defaultReply('There is no channel set for that Discord event.');
		}

		const newEvent = await this.module.karaoke.createScheduledEvent({
			id: discordEvent.channelId,
			guildId: interaction.guildId,
			textChannelId: textChannel.id,
			discordEventId,
			roleId: role?.id
		});

		return interaction.editReply({
			content: `https://discord.com/events/${interaction.guildId}/${discordEvent.id}`,
			embeds: [
				new EmbedBuilder()
					.setColor(EmbedColors.Default)
					.setAuthor({ name: `${Emoji.Microphone} Karaoke management`, iconURL: getGuildIcon(interaction.guild) })
					.setTitle(discordEvent.channel.name)
					.addFields([
						{ name: 'Scheduled event:', value: discordEvent.name, inline: true },
						{ name: 'Event time:', value: time(Math.floor(discordEvent.scheduledStartTimestamp! / 1000)), inline: true },
						{ name: BlankSpace, value: BlankSpace, inline: false },
						{ name: 'Voice channel:', value: channelMention(newEvent.id), inline: true },
						{ name: 'Text channel:', value: channelMention(newEvent.textChannelId), inline: true },
						{ name: 'Queue lock:', value: newEvent.locked ? `${Emoji.Locked} locked` : `${Emoji.Unlocked} unlocked`, inline: true }
					])
			]
		});
	}

	public async chatInputKaraokeStop(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
		const eventId = interaction.options.getString('event', true);

		const active = await this.module.karaoke.isEventActive(interaction.guildId, eventId);
		if (!active) {
			return interaction.defaultReply('There is no karaoke event to stop.');
		}

		const event = await this.module.karaoke.fetchEvent(eventId);

		await this.module.karaoke.endEvent(interaction.guild, event!);

		return interaction.successReply('The karaoke event has ended.');
	}

	public async chatInputKaraokeAdd(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
		const { guildId } = interaction;
		const { karaoke } = this.module;

		const eventId = interaction.options.getString('event', true);
		const member = interaction.options.getMember('user');

		if (isNullish(member)) {
			return interaction.errorReply('That user is not in this server.');
		}

		const active = await karaoke.isEventActive(guildId, eventId);
		if (!active) {
			return interaction.errorReply('There is no karaoke event to add a user to.');
		}

		if (isNullish(member.voice.channel) || member.voice.channelId !== eventId) {
			return interaction.errorReply('That user is not in the event channel.');
		}

		const event = await karaoke.fetchEventWithQueue(eventId);
		if (isNullish(event)) {
			return interaction.errorReply('Something went wrong.');
		}

		const { valid, reason } = karaoke.isAddValid(event, member.id);
		if (!valid) {
			return interaction.errorReply(reason);
		}

		const updatedEvent = await karaoke.addUserToQueue(eventId, {
			id: member.id,
			name: member.displayName
		});

		if (updatedEvent.queue.length === 1) {
			await karaoke.setUserToSinger(interaction.guild.members, updatedEvent.queue[0]);

			const textChannel = (await interaction.guild.channels.fetch(updatedEvent.textChannelId)) as GuildTextBasedChannel | null;
			if (isNullish(textChannel)) return;

			const embed = karaoke.buildQueueEmbed(updatedEvent);

			await textChannel.send({
				content: `${userMention(member.id)} is up!`,
				embeds: [embed],
				allowedMentions: { users: [] }
			});
		}

		return interaction.successReply(`${member.user.tag} has been added to the queue.`);
	}

	public async chatInputKaraokeRemove(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
		const { guildId } = interaction;
		const { karaoke } = this.module;

		const eventId = interaction.options.getString('event', true);
		const member = interaction.options.getMember('user');

		if (isNullish(member)) {
			return interaction.errorReply('That user is not in this server.');
		}

		const active = await karaoke.isEventActive(guildId, eventId);
		if (!active) {
			return interaction.errorReply('There is no karaoke event to remove a user from.');
		}

		if (isNullish(member.voice.channel) || member.voice.channelId !== eventId) {
			return interaction.errorReply('That user is not in the event channel.');
		}

		const event = await karaoke.fetchEventWithQueue(eventId);
		if (isNullish(event)) {
			return interaction.errorReply("Something went wrong. The bot's dev had been notified of the error.");
		}

		const userEntry = event.queue.find((e) => e.id === member.id);
		if (isNullish(userEntry)) {
			return interaction.defaultReply('That user is not in the queue.');
		}

		if (event.queue[0].id === member.id || event.queue[0].partnerId === member.id) {
			const textChannel = (await interaction.guild.channels.fetch(event.textChannelId)) as GuildTextBasedChannel | null;
			await karaoke.forceRemoveUserFromQueue(interaction.guild.members, event, textChannel, interaction.user.id);
		} else {
			await karaoke.removeUserFromQueue(eventId, { id: userEntry.id, partnerId: userEntry.partnerId });

			const content = userEntry.partnerId
				? `${userMention(userEntry.id)} & ${userMention(userEntry.partnerId)} have`
				: `${userMention(userEntry.id)} has`;

			await interaction.channel!.send({
				content: `${content} been removed from the queue by ${interaction.user.id}.`,
				allowedMentions: { users: userEntry.partnerId ? [userEntry.id, userEntry.partnerId] : [userEntry.id] }
			});
		}

		return interaction.successReply(`${member.user.tag} has been removed from the queue.`);
	}

	public async chatInputKaraokeMenu(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
		return new KaraokeEventMenu(interaction.guild).run(interaction);
	}
}
