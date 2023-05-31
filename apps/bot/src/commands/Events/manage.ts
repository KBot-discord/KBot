import { KaraokeEventMenu } from '#structures/menus/KaraokeEventMenu';
import { BlankSpace, EmbedColors, KBotEmoji, formGenericError } from '#utils/constants';
import { getGuildIcon } from '#utils/discord';
import { KBotCommand } from '#extensions/KBotCommand';
import { KBotErrors, KBotModules } from '#types/Enums';
import { isNullOrUndefined } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import { channelMention, time, userMention } from '@discordjs/builders';
import { ChannelType, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import type { ApplicationCommandOptionChoiceData, GuildScheduledEvent, GuildTextBasedChannel, StageChannel, VoiceChannel } from 'discord.js';
import type { EventModule } from '#modules/EventModule';

@ApplyOptions<KBotCommand.Options>({
	module: KBotModules.Events,
	description: 'Create, end, or manage events.',
	preconditions: ['ModuleEnabled'],
	requiredClientPermissions: [PermissionFlagsBits.MuteMembers, PermissionFlagsBits.MoveMembers, PermissionFlagsBits.ManageChannels],
	runIn: [CommandOptionsRunTypeEnum.GuildAny],
	helpEmbed: (builder) => {
		return builder //
			.setName('Manage')
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
				.filter((e) => !isNullOrUndefined(e))
				.map((channel) => ({ name: channel!.name, value: channel!.id }));

			return interaction.respond(eventOptions);
		}

		const discordEvents = await interaction.guild.scheduledEvents.fetch();
		if (discordEvents.size === 0) {
			return interaction.respond([]);
		}

		const discordEventOptions: ApplicationCommandOptionChoiceData[] = discordEvents
			.filter((event) => !isNullOrUndefined(event.channelId))
			.map((event) => ({ name: event.name, value: event.id }));

		return interaction.respond(discordEventOptions);
	}

	public override async chatInputRun(interaction: KBotCommand.ChatInputCommandInteraction): Promise<unknown> {
		await interaction.deferReply({ ephemeral: true });

		switch (interaction.options.getSubcommandGroup(true)) {
			default: {
				switch (interaction.options.getSubcommand(true)) {
					case 'start':
						return this.chatInputKaraokeStart(interaction);
					case 'schedule':
						return this.chatInputKaraokeSchedule(interaction);
					case 'stop':
						return this.chatInputKaraokeStop(interaction);
					case 'add':
						return this.chatInputKaraokeAdd(interaction);
					case 'remove':
						return this.chatInputKaraokeRemove(interaction);
					case 'menu':
						return this.chatInputKaraokeMenu(interaction);
					default:
						return this.unknownSubcommand(interaction);
				}
			}
		}
	}

	public async chatInputKaraokeStart(interaction: KBotCommand.ChatInputCommandInteraction): Promise<unknown> {
		const { validator } = this.container;

		const voiceChannel = interaction.options.getChannel('voice_channel', true, [
			ChannelType.GuildStageVoice, //
			ChannelType.GuildVoice
		]);
		const textChannel = interaction.options.getChannel('text_channel', true, [
			ChannelType.GuildText,
			ChannelType.PublicThread,
			ChannelType.GuildStageVoice,
			ChannelType.GuildVoice
		]);
		const topic = interaction.options.getString('topic');
		const role = interaction.options.getRole('role');

		const event = await this.module.karaoke.getEvent(voiceChannel.id);
		if (event) {
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

		const result = await this.module.karaoke.startEvent(interaction.guild, voiceChannel, textChannel, {
			stageTopic: topic,
			roleId: role?.id
		});

		return result.match({
			ok: () => {
				return interaction.successReply('The karaoke event has started.');
			},
			err: (error) => {
				this.container.logger.sentryError(error, {
					context: {
						event,
						guildId: interaction.guild.id
					}
				});

				return interaction.errorReply(formGenericError('Something went wrong when trying to start the event.'));
			}
		});
	}

	public async chatInputKaraokeSchedule(interaction: KBotCommand.ChatInputCommandInteraction): Promise<unknown> {
		const { client, validator } = this.container;

		const discordEventId = interaction.options.getString('discord_event', true);
		const textChannel = interaction.options.getChannel('text_channel', true, [
			ChannelType.GuildText,
			ChannelType.PublicThread,
			ChannelType.GuildStageVoice,
			ChannelType.GuildVoice
		]);
		const role = interaction.options.getRole('role');

		// TODO: check validation
		const discordEvent = (await interaction.guild.scheduledEvents.fetch(discordEventId)) as GuildScheduledEvent | undefined;
		if (isNullOrUndefined(discordEvent)) {
			return interaction.errorReply('That is not a valid discord event.');
		}

		if (isNullOrUndefined(discordEvent.channelId) || isNullOrUndefined(discordEvent.channel)) {
			return interaction.defaultReply('There is no channel set for that Discord event.');
		}

		const voiceChannel = (await client.channels.fetch(discordEvent.channelId)) as StageChannel | VoiceChannel | null;
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

		const event = await this.module.karaoke.getEvent(eventId);
		if (!event) {
			this.container.logger.sentryMessage('Failed to find an event that was trying to be ended', {
				context: { eventId }
			});
			return interaction.errorReply(formGenericError());
		}

		if (!event.isActive) {
			return interaction.defaultReply('There is no karaoke event to stop.');
		}

		const result = await this.module.karaoke.endEvent(interaction.guild, event);

		return result.match({
			ok: () => {
				return interaction.successReply('The karaoke event has ended.');
			},
			err: (error) => {
				this.container.logger.sentryError(error, {
					context: {
						event,
						guildId: interaction.guild.id
					}
				});

				return interaction.errorReply(formGenericError('Something went wrong when trying to end the event.'));
			}
		});
	}

	public async chatInputKaraokeAdd(interaction: KBotCommand.ChatInputCommandInteraction): Promise<unknown> {
		const { guild } = interaction;
		const { karaoke } = this.module;

		const eventId = interaction.options.getString('event', true);
		const member = interaction.options.getMember('user');

		if (isNullOrUndefined(member)) {
			return interaction.errorReply('That user is not in this server.');
		}

		if (isNullOrUndefined(member.voice.channel) || member.voice.channelId !== eventId) {
			return interaction.errorReply('That user is not in the event channel.');
		}

		const event = await karaoke.getEventWithQueue(eventId);
		if (isNullOrUndefined(event)) {
			this.container.logger.sentryMessage('Failed to fetch an event that was set as active', {
				context: { eventId }
			});
			return interaction.errorReply(formGenericError());
		}

		if (!event.isActive) {
			return interaction.defaultReply('There is no karaoke event to stop.');
		}

		const voiceChannel = (await guild.channels.fetch(eventId)) as StageChannel | VoiceChannel | null;
		const voiceResult = await this.container.validator.channels.canModerateVoice(voiceChannel);
		if (!voiceResult.result) {
			return interaction.client.emit(KBotErrors.ChannelPermissions, {
				interaction,
				error: voiceResult.error
			});
		}

		const textChannel = (await guild.channels.fetch(event.textChannelId)) as GuildTextBasedChannel | null;
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

		const updatedEvent = await karaoke.addUserToQueue(eventId, {
			id: member.id,
			name: member.displayName
		});

		if (updatedEvent.queue.length === 1) {
			await karaoke.setUserToSinger(member);
			await textChannel!.send({
				content: `${userMention(member.id)} is up!`,
				embeds: [karaoke.buildQueueEmbed(updatedEvent)],
				allowedMentions: { users: [] }
			});
		}

		return interaction.successReply(`${member.user.username} has been added to the queue.`);
	}

	public async chatInputKaraokeRemove(interaction: KBotCommand.ChatInputCommandInteraction): Promise<unknown> {
		const { guild } = interaction;
		const { karaoke } = this.module;

		const eventId = interaction.options.getString('event', true);
		const member = interaction.options.getMember('user');

		if (isNullOrUndefined(member)) {
			return interaction.errorReply('That user is not in this server.');
		}

		if (isNullOrUndefined(member.voice.channel) || member.voice.channelId !== eventId) {
			return interaction.errorReply('That user is not in the event channel.');
		}

		const event = await karaoke.getEventWithQueue(eventId);
		if (isNullOrUndefined(event)) {
			this.container.logger.sentryMessage('Failed to fetch an event that was set as active', {
				context: { eventId }
			});
			return interaction.errorReply(formGenericError());
		}

		if (!event.isActive) {
			return interaction.defaultReply('There is no karaoke event to stop.');
		}

		const voiceChannel = (await guild.channels.fetch(eventId)) as StageChannel | VoiceChannel | null;
		const voiceResult = await this.container.validator.channels.canModerateVoice(voiceChannel);
		if (!voiceResult.result) {
			return interaction.client.emit(KBotErrors.ChannelPermissions, {
				interaction,
				error: voiceResult.error
			});
		}

		const textChannel = (await guild.channels.fetch(event.textChannelId)) as GuildTextBasedChannel | null;
		const textResult = await this.container.validator.channels.canSendEmbeds(textChannel);
		if (!textResult.result) {
			return interaction.client.emit(KBotErrors.ChannelPermissions, {
				interaction,
				error: textResult.error
			});
		}

		const userEntry = event.queue.find((e) => e.id === member.id);
		if (isNullOrUndefined(userEntry)) {
			return interaction.defaultReply('That user is not in the queue.');
		}

		if (event.queue[0].id === member.id || event.queue[0].partnerId === member.id) {
			await karaoke.forceRemoveUserFromQueue(interaction.guild, event, textChannel!, interaction.user.id);
		} else {
			await karaoke.removeUserFromQueue(eventId, { id: userEntry.id, partnerId: userEntry.partnerId });

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

		return interaction.successReply(`${member.user.username} has been removed from the queue.`);
	}

	public async chatInputKaraokeMenu(interaction: KBotCommand.ChatInputCommandInteraction): Promise<unknown> {
		return new KaraokeEventMenu(interaction.guild).run(interaction);
	}
}
