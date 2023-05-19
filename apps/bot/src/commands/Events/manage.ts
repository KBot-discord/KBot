import { KaraokeEventMenu } from '#structures/menus/KaraokeEventMenu';
import { BlankSpace, EmbedColors, KBotEmoji } from '#utils/constants';
import { getGuildIcon } from '#utils/discord';
import { KBotCommand } from '#extensions/KBotCommand';
import { KBotErrors } from '#types/Enums';
import { UnknownCommandError } from '#structures/errors/UnknownCommandError';
import { ApplyOptions } from '@sapphire/decorators';
import { ChannelType, PermissionFlagsBits } from 'discord-api-types/v10';
import { isNullish } from '@sapphire/utilities';
import { channelMention, time, userMention } from '@discordjs/builders';
import { EmbedBuilder, type VoiceBasedChannel } from 'discord.js';
import { CommandOptionsRunTypeEnum, container } from '@sapphire/framework';
import type { GuildTextBasedChannel, StageChannel, VoiceChannel, GuildScheduledEvent, ApplicationCommandOptionChoiceData } from 'discord.js';
import type { EventModule } from '#modules/EventModule';

@ApplyOptions<KBotCommand.Options>({
	description: 'Create, end, or manage events.',
	preconditions: ['ModuleEnabled'],
	requiredClientPermissions: [PermissionFlagsBits.MuteMembers, PermissionFlagsBits.MoveMembers, PermissionFlagsBits.ManageChannels],
	runIn: [CommandOptionsRunTypeEnum.GuildAny],
	helpEmbed: (builder) => {
		return builder //
			.setName('Manage')
			.setDescription('Create, end, or manage events.')
			.setSubcommands([
				{
					label: '/manage karaoke start <voice_channel> <text_channel> [topic] [role]',
					description: 'Start a karaoke event'
				}, //
				{
					label: '/manage karaoke schedule <discord_event> <text_channel> [role]',
					description: 'Schedule a karaoke event'
				},
				{ label: '/manage karaoke stop <event>', description: 'Stop a karaoke event' },
				{
					label: '/manage karaoke add <event> <user>',
					description: 'Add a user to a karaoke queue'
				},
				{
					label: '/manage karaoke remove <event> <user>',
					description: 'Remove a user to a karaoke queue'
				},
				{ label: '/manage karaoke menu', description: 'Open the menu to manage karaoke events' }
			]);
	}
})
export class EventsCommand extends KBotCommand<EventModule> {
	public constructor(context: KBotCommand.Context, options: KBotCommand.Options) {
		super(context, { ...options }, container.events);
	}

	public override disabledMessage = (moduleFullName: string): string => {
		return `[${moduleFullName}] The module for this command is disabled.\nYou can run \`/events toggle\` to enable it.`;
	};

	public override registerApplicationCommands(registry: KBotCommand.Registry): void {
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
											.setDescription('The stage or voice channel for the karaoke event')
											.addChannelTypes(ChannelType.GuildStageVoice, ChannelType.GuildVoice)
											.setRequired(true)
									)
									.addChannelOption((chan) =>
										chan
											.setName('text_channel')
											.setDescription('The channel to show queue rotations and instructions')
											.addChannelTypes(ChannelType.GuildText, ChannelType.PublicThread, ChannelType.GuildStageVoice, ChannelType.GuildVoice)
											.setRequired(true)
									)
									.addStringOption((topic) =>
										topic //
											.setName('topic')
											.setDescription('If it\'s a stage channel, the topic of the stage (default: "Karaoke Event")')
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
											.setDescription('The Discord event that the karaoke event will be for')
											.setAutocomplete(true)
											.setRequired(true)
									)
									.addChannelOption((chan) =>
										chan
											.setName('text_channel')
											.setDescription('The channel to show queue rotations and instructions')
											.addChannelTypes(ChannelType.GuildText, ChannelType.PublicThread, ChannelType.GuildStageVoice, ChannelType.GuildVoice)
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
									.setDescription('Remove a user from a karaoke queue')
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
				guildIds: []
			}
		);
	}

	public override async autocompleteRun(interaction: KBotCommand.AutocompleteInteraction): Promise<void> {
		const focusedOption = interaction.options.getFocused(true);

		if (focusedOption.name === 'event') {
			const events = await this.module.karaoke.getEventByGuild(interaction.guildId);
			if (events.length === 0) {
				return interaction.respond([]);
			}

			const channelData = await Promise.all(events.map(async ({ id }) => interaction.guild.channels.fetch(id)));

			const eventOptions: ApplicationCommandOptionChoiceData[] = channelData //
				.filter((e) => !isNullish(e))
				.map((channel) => ({ name: channel!.name, value: channel!.id }));

			return interaction.respond(eventOptions);
		}

		const discordEvents = await interaction.guild.scheduledEvents.fetch();
		if (discordEvents.size === 0) {
			return interaction.respond([]);
		}

		const discordEventOptions: ApplicationCommandOptionChoiceData[] = discordEvents
			.filter((event) => !isNullish(event.channelId))
			.map((event) => ({ name: event.name, value: event.id }));

		return interaction.respond(discordEventOptions);
	}

	public override async chatInputRun(interaction: KBotCommand.ChatInputCommandInteraction): Promise<unknown> {
		await interaction.deferReply({ ephemeral: true });
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
					case 'menu': {
						return this.chatInputKaraokeMenu(interaction);
					}
					default: {
						return interaction.client.emit(KBotErrors.UnknownCommand, {
							interaction,
							error: new UnknownCommandError()
						});
					}
				}
			}
		}
	}

	public async chatInputKaraokeStart(interaction: KBotCommand.ChatInputCommandInteraction): Promise<unknown> {
		const { validator } = this.container;

		const voiceChannel = interaction.options.getChannel('voice_channel', true) as VoiceBasedChannel;
		const textChannel = interaction.options.getChannel('text_channel', true) as GuildTextBasedChannel;
		const topic = interaction.options.getString('topic');
		const role = interaction.options.getRole('role');

		const exists = await this.module.karaoke.eventExists(interaction.guildId, voiceChannel.id);
		if (exists) {
			return interaction.defaultReply('There is already an event in that channel.');
		}

		const voiceResult = await validator.channels.canModerateVoice(voiceChannel);
		if (!voiceResult.result) {
			return interaction.client.emit(KBotErrors.ChannelPermissions, {
				interaction,
				error: voiceResult.error
			});
		}

		const textResult = await validator.channels.canSendEmbeds(textChannel);
		if (!textResult.result) {
			return interaction.client.emit(KBotErrors.ChannelPermissions, {
				interaction,
				error: textResult.error
			});
		}

		await this.module.karaoke.startEvent(interaction.guild, voiceChannel, textChannel, topic, role?.id);

		return interaction.successReply('The karaoke event has started.');
	}

	public async chatInputKaraokeSchedule(interaction: KBotCommand.ChatInputCommandInteraction): Promise<unknown> {
		const { client, validator } = this.container;

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

		const voiceChannel = (await client.channels.fetch(discordEvent.channelId)) as StageChannel | VoiceChannel;
		const voiceResult = await validator.channels.canModerateVoice(voiceChannel);
		if (!voiceResult.result) {
			return interaction.client.emit(KBotErrors.ChannelPermissions, {
				interaction,
				error: voiceResult.error
			});
		}

		const textResult = await validator.channels.canSendEmbeds(textChannel);
		if (!textResult.result) {
			return interaction.client.emit(KBotErrors.ChannelPermissions, {
				interaction,
				error: textResult.error
			});
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
					.setAuthor({
						name: `${KBotEmoji.Microphone} Karaoke management`,
						iconURL: getGuildIcon(interaction.guild)
					})
					.setTitle(discordEvent.channel.name)
					.addFields([
						{ name: 'Scheduled event:', value: discordEvent.name, inline: true },
						{
							name: 'Event time:',
							value: time(Math.floor(discordEvent.scheduledStartTimestamp! / 1000)),
							inline: true
						},
						{ name: BlankSpace, value: BlankSpace, inline: false },
						{ name: 'Voice channel:', value: channelMention(newEvent.id), inline: true },
						{ name: 'Text channel:', value: channelMention(newEvent.textChannelId), inline: true },
						{
							name: 'Queue lock:',
							value: newEvent.locked ? `${KBotEmoji.Locked} locked` : `${KBotEmoji.Unlocked} unlocked`,
							inline: true
						}
					])
			]
		});
	}

	public async chatInputKaraokeStop(interaction: KBotCommand.ChatInputCommandInteraction): Promise<unknown> {
		const eventId = interaction.options.getString('event', true);

		const active = await this.module.karaoke.eventActive(interaction.guildId, eventId);
		if (!active) {
			return interaction.defaultReply('There is no karaoke event to stop.');
		}

		const event = await this.module.karaoke.getEvent(eventId);
		// TODO: Better error handling
		if (!event) {
			return interaction.errorReply('There was an error when ending the event. The devs will work on a fix soon.');
		}

		await this.module.karaoke.endEvent(interaction.guild, event);

		return interaction.successReply('The karaoke event has ended.');
	}

	public async chatInputKaraokeAdd(interaction: KBotCommand.ChatInputCommandInteraction): Promise<unknown> {
		const { guildId } = interaction;
		const { karaoke } = this.module;

		const eventId = interaction.options.getString('event', true);
		const member = interaction.options.getMember('user');

		if (isNullish(member)) {
			return interaction.errorReply('That user is not in this server.');
		}

		const active = await karaoke.eventActive(guildId, eventId);
		if (!active) {
			return interaction.errorReply('There is no karaoke event to add a user to.');
		}

		if (isNullish(member.voice.channel) || member.voice.channelId !== eventId) {
			return interaction.errorReply('That user is not in the event channel.');
		}

		const event = await karaoke.getEventWithQueue(eventId);
		if (isNullish(event)) {
			this.container.logger.error('Failed to fetch an event that was active');
			return interaction.errorReply("Something went wrong. The bot's dev had been notified of the error.");
		}

		const voiceChannel = (await interaction.guild.channels.fetch(eventId)) as StageChannel | VoiceChannel | null;
		const voiceResult = await this.container.validator.channels.canModerateVoice(voiceChannel);
		if (!voiceResult.result) {
			return interaction.client.emit(KBotErrors.ChannelPermissions, {
				interaction,
				error: voiceResult.error
			});
		}

		const textChannel = (await interaction.guild.channels.fetch(event.textChannelId)) as GuildTextBasedChannel | null;
		const textResult = await this.container.validator.channels.canSendEmbeds(textChannel);
		if (!textResult.result) {
			return interaction.client.emit(KBotErrors.ChannelPermissions, {
				interaction,
				error: textResult.error
			});
		}

		const { valid, reason } = karaoke.isAddValid(event, member.id);
		if (!valid) {
			return interaction.errorReply(reason);
		}

		const updatedEvent = await karaoke.addUserToQueue(
			{ eventId },
			{
				id: member.id,
				name: member.displayName
			}
		);

		if (updatedEvent.queue.length === 1) {
			await karaoke.setUserToSinger(interaction.guild.members, updatedEvent.queue[0]);
			await textChannel!.send({
				content: `${userMention(member.id)} is up!`,
				embeds: [karaoke.buildQueueEmbed(updatedEvent)],
				allowedMentions: { users: [] }
			});
		}

		return interaction.successReply(`${member.user.tag} has been added to the queue.`);
	}

	public async chatInputKaraokeRemove(interaction: KBotCommand.ChatInputCommandInteraction): Promise<unknown> {
		const { guildId } = interaction;
		const { karaoke } = this.module;

		const eventId = interaction.options.getString('event', true);
		const member = interaction.options.getMember('user');

		if (isNullish(member)) {
			return interaction.errorReply('That user is not in this server.');
		}

		const active = await karaoke.eventActive(guildId, eventId);
		if (!active) {
			return interaction.errorReply('There is no karaoke event to remove a user from.');
		}

		if (isNullish(member.voice.channel) || member.voice.channelId !== eventId) {
			return interaction.errorReply('That user is not in the event channel.');
		}

		const event = await karaoke.getEventWithQueue(eventId);
		if (isNullish(event)) {
			this.container.logger.error('Failed to fetch an event that was active');
			return interaction.errorReply("Something went wrong. The bot's dev had been notified of the error.");
		}

		const voiceChannel = (await interaction.guild.channels.fetch(eventId)) as StageChannel | VoiceChannel | null;
		const voiceResult = await this.container.validator.channels.canModerateVoice(voiceChannel);
		if (!voiceResult.result) {
			return interaction.client.emit(KBotErrors.ChannelPermissions, {
				interaction,
				error: voiceResult.error
			});
		}

		const textChannel = (await interaction.guild.channels.fetch(event.textChannelId)) as GuildTextBasedChannel | null;
		const textResult = await this.container.validator.channels.canSendEmbeds(textChannel);
		if (!textResult.result) {
			return interaction.client.emit(KBotErrors.ChannelPermissions, {
				interaction,
				error: textResult.error
			});
		}

		const userEntry = event.queue.find((e) => e.id === member.id);
		if (isNullish(userEntry)) {
			return interaction.defaultReply('That user is not in the queue.');
		}

		if (event.queue[0].id === member.id || event.queue[0].partnerId === member.id) {
			await karaoke.forceRemoveUserFromQueue(interaction.guild.members, event, textChannel!, interaction.user.id);
		} else {
			await karaoke.removeUserFromQueue({ eventId }, { id: userEntry.id, partnerId: userEntry.partnerId });

			const content = userEntry.partnerId
				? `${userMention(userEntry.id)} & ${userMention(userEntry.partnerId)} have`
				: `${userMention(userEntry.id)} has`;

			await interaction.channel!.send({
				content: `${content} been removed from the queue by ${interaction.user.id}.`,
				allowedMentions: {
					users: userEntry.partnerId ? [userEntry.id, userEntry.partnerId] : [userEntry.id]
				}
			});
		}

		return interaction.successReply(`${member.user.tag} has been removed from the queue.`);
	}

	public async chatInputKaraokeMenu(interaction: KBotCommand.ChatInputCommandInteraction): Promise<unknown> {
		return new KaraokeEventMenu(interaction.guild).run(interaction);
	}
}
