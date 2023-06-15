import { EmbedColors } from '#utils/constants';
import { KBotErrors, KBotModules } from '#types/Enums';
import { isNullOrUndefined } from '#utils/functions';
import { fetchChannel } from '#utils/discord';
import { KBotSubcommand } from '#extensions/KBotSubcommand';
import { ApplyOptions } from '@sapphire/decorators';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { channelMention, userMention } from '@discordjs/builders';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import type { ButtonInteraction, GuildTextBasedChannel, VoiceBasedChannel } from 'discord.js';
import type { EventModule } from '#modules/EventModule';

@ApplyOptions<KBotSubcommand.Options>({
	module: KBotModules.Events,
	description: 'Join or leave the karaoke queue.',
	preconditions: ['EDefer', 'ModuleEnabled'],
	requiredClientPermissions: [PermissionFlagsBits.MuteMembers, PermissionFlagsBits.MoveMembers, PermissionFlagsBits.ManageChannels],
	runIn: [CommandOptionsRunTypeEnum.GuildAny],
	helpEmbed: (builder) => {
		return builder //
			.setName('Karaoke')
			.setSubcommands([
				{ label: '/karaoke join', description: 'Join the queue' }, //
				{ label: '/karaoke duet <partner>', description: 'Join the queue as a duet' },
				{ label: '/karaoke leave', description: 'Leave the queue' },
				{ label: '/karaoke queue', description: 'Show the current queue' },
				{ label: '/karaoke help', description: 'Show info about karaoke commands' }
			]);
	},
	subcommands: [
		{ name: 'join', chatInputRun: 'chatInputJoin' },
		{ name: 'duet', chatInputRun: 'chatInputDuet' },
		{ name: 'leave', chatInputRun: 'chatInputLeave' },
		{ name: 'queue', chatInputRun: 'chatInputQueue' },
		{ name: 'help', chatInputRun: 'chatInputHelp' }
	]
})
export class EventsCommand extends KBotSubcommand<EventModule> {
	public override disabledMessage = (moduleFullName: string): string => {
		return `[${moduleFullName}] The module for this command is disabled.\nYou, or a moderator, can run \`/events toggle\` to enable it.`;
	};

	public override registerApplicationCommands(registry: KBotSubcommand.Registry): void {
		registry.registerChatInputCommand(
			(builder) =>
				builder //
					.setName('karaoke')
					.setDescription(this.description)
					.setDefaultMemberPermissions(undefined)
					.setDMPermission(false)
					.addSubcommand((subcommand) =>
						subcommand //
							.setName('join')
							.setDescription('Join the queue')
					)
					.addSubcommand((subcommand) =>
						subcommand //
							.setName('duet')
							.setDescription('Join the queue as a duet')
							.addUserOption((option) =>
								option //
									.setName('partner')
									.setDescription('The partner for your duet')
									.setRequired(true)
							)
					)
					.addSubcommand((subcommand) =>
						subcommand //
							.setName('leave')
							.setDescription('Leave the queue')
					)
					.addSubcommand((subcommand) =>
						subcommand //
							.setName('queue')
							.setDescription('Show the current queue')
					)
					.addSubcommand((subcommand) =>
						subcommand //
							.setName('help')
							.setDescription('Show info about karaoke commands')
					),
			{
				idHints: [],
				guildIds: []
			}
		);
	}

	public async chatInputJoin(interaction: KBotSubcommand.ChatInputCommandInteraction): Promise<unknown> {
		const { karaoke } = this.module;
		const { member } = interaction;

		const eventId = member.voice.channelId;
		if (isNullOrUndefined(eventId)) {
			return interaction.defaultReply('You are not in a voice channel.');
		}

		const event = await karaoke.getEventWithQueue(eventId);
		if (isNullOrUndefined(event) || !event.isActive) {
			return interaction.defaultReply('There is no karaoke event to join.');
		}

		const voiceChannel = await fetchChannel<VoiceBasedChannel>(eventId);
		const voiceResult = await this.container.validator.channels.canModerateVoice(voiceChannel);
		if (!voiceResult.result) {
			return interaction.client.emit(KBotErrors.ChannelPermissions, {
				interaction,
				error: voiceResult.error
			});
		}

		const textChannel = await fetchChannel<GuildTextBasedChannel>(event.textChannelId);
		const textResult = await this.container.validator.channels.canSendEmbeds(textChannel);
		if (!textResult.result) {
			return interaction.client.emit(KBotErrors.ChannelPermissions, {
				interaction,
				error: textResult.error
			});
		}

		const { valid, reason } = karaoke.isJoinValid(event, member.id);
		if (!valid) {
			return interaction.errorReply(reason);
		}

		const updatedEvent = await karaoke.addUserToQueue(
			eventId, //
			{ id: member.id, name: member.displayName }
		);

		if (updatedEvent.queue.length === 1) {
			await karaoke.setUserToSinger(interaction.member);

			await textChannel!.send({
				content: `${userMention(member.id)} is up!`,
				embeds: [karaoke.buildQueueEmbed(updatedEvent)],
				allowedMentions: { users: [] }
			});
		}

		return interaction.successReply('You have successfully joined the queue.');
	}

	public async chatInputDuet(interaction: KBotSubcommand.ChatInputCommandInteraction): Promise<unknown> {
		const { karaoke } = this.module;
		const { member } = interaction;

		const eventId = member.voice.channelId;
		if (isNullOrUndefined(eventId)) {
			return interaction.defaultReply('You are not in a voice channel.');
		}

		const partner = interaction.options.getMember('partner');
		if (isNullOrUndefined(partner)) {
			return interaction.defaultReply('That user is not in this server.');
		}

		const event = await karaoke.getEventWithQueue(eventId);
		if (isNullOrUndefined(event) || !event.isActive) {
			return interaction.defaultReply('There is no karaoke event to join.');
		}

		const voiceChannel = await fetchChannel<VoiceBasedChannel>(eventId);
		const voiceResult = await this.container.validator.channels.canModerateVoice(voiceChannel);
		if (!voiceResult.result) {
			return interaction.client.emit(KBotErrors.ChannelPermissions, {
				interaction,
				error: voiceResult.error
			});
		}

		const textChannel = await fetchChannel<GuildTextBasedChannel>(event.textChannelId);
		const textResult = await this.container.validator.channels.canSendEmbeds(textChannel);
		if (!textResult.result) {
			return interaction.client.emit(KBotErrors.ChannelPermissions, {
				interaction,
				error: textResult.error
			});
		}

		const { valid, reason } = karaoke.isJoinValid(event, member.id, partner);
		if (!valid) {
			return interaction.errorReply(reason);
		}

		const response = await this.duetConfirmation(textChannel!, member.id, partner.id);
		if (isNullOrUndefined(response)) {
			return interaction.defaultReply("Your duet partner didn't respond to your join request.");
		} else if (!response) {
			return interaction.defaultReply('Your duet partner denied your join request.');
		}

		const updatedEvent = await karaoke.addUserToQueue(eventId, {
			id: member.id,
			name: member.displayName,
			partnerId: partner.id,
			partnerName: partner.displayName
		});

		if (updatedEvent.queue.length === 1) {
			await karaoke.setUserToSinger(member, partner);
			await textChannel!.send({
				content: `${userMention(member.id)} & ${userMention(partner.id)} are up!`,
				embeds: [karaoke.buildQueueEmbed(updatedEvent)],
				allowedMentions: { users: [] }
			});
		}

		return interaction.successReply(`Successfully joined queue as a duet with ${userMention(partner.id)}.`);
	}

	public async chatInputLeave(interaction: KBotSubcommand.ChatInputCommandInteraction): Promise<unknown> {
		const { karaoke } = this.module;
		const { member } = interaction;

		const eventId = member.voice.channelId;
		if (isNullOrUndefined(eventId)) {
			return interaction.defaultReply('You are not in a voice channel.');
		}

		const event = await karaoke.getEventWithQueue(eventId);
		if (isNullOrUndefined(event) || !event.isActive) {
			return interaction.defaultReply('There is no karaoke event to join.');
		}

		const voiceChannel = await fetchChannel<VoiceBasedChannel>(eventId);
		const voiceResult = await this.container.validator.channels.canModerateVoice(voiceChannel);
		if (!voiceResult.result) {
			return interaction.client.emit(KBotErrors.ChannelPermissions, {
				interaction,
				error: voiceResult.error
			});
		}

		const textChannel = await fetchChannel<GuildTextBasedChannel>(event.textChannelId);
		const textResult = await this.container.validator.channels.canSendEmbeds(textChannel);
		if (!textResult.result) {
			return interaction.client.emit(KBotErrors.ChannelPermissions, {
				interaction,
				error: textResult.error
			});
		}

		const userEntry = event.queue.find((entry) => entry.id === member.id || entry.partnerId === member.id);
		if (isNullOrUndefined(userEntry)) {
			return interaction.defaultReply('You are not in the queue.');
		}

		if (event.queue[0].id === member.id || event.queue[0].partnerId === member.id) {
			await karaoke.rotateQueue(interaction.guild, event, textChannel!);
		} else {
			await karaoke.removeUserFromQueue(eventId, { id: userEntry.id, partnerId: userEntry.partnerId ?? undefined });

			if (userEntry.partnerId) {
				const ping = member.id === userEntry.id ? userEntry.partnerId : userEntry.id;
				await textChannel!.send({
					content: `${userMention(userEntry.id)} & ${userMention(userEntry.partnerId)} have left the queue.`,
					allowedMentions: { users: [ping] }
				});
			}
		}

		return interaction.defaultReply('Successfully left queue.');
	}

	public async chatInputQueue(interaction: KBotSubcommand.ChatInputCommandInteraction): Promise<unknown> {
		const { karaoke } = this.module;

		const eventId = interaction.member.voice.channelId;
		if (isNullOrUndefined(eventId)) {
			return interaction.defaultReply('You are not in a voice channel.');
		}

		const event = await karaoke.getEventWithQueue(eventId);
		if (isNullOrUndefined(event) || !event.isActive) {
			return interaction.defaultReply('There is no karaoke event to join.');
		}

		return interaction.editReply({
			embeds: [karaoke.buildQueueEmbed(event)]
		});
	}

	public async chatInputHelp(interaction: KBotSubcommand.ChatInputCommandInteraction): Promise<unknown> {
		const { karaoke } = this.module;

		const events = await karaoke.getEventByGuild(interaction.guildId);
		const formattedEvents =
			events.length === 0
				? []
				: events.map((event, index) =>
						new EmbedBuilder()
							.setColor(EmbedColors.Default)
							.setDescription(`**Event #${index + 1}** - ${event.id}`)
							.addFields(
								{ name: 'Voice channel', value: channelMention(event.id), inline: true },
								{
									name: 'Command channel',
									value: channelMention(event.textChannelId),
									inline: true
								}
							)
				  );

		return interaction.editReply({
			embeds: [
				new EmbedBuilder()
					.setColor(EmbedColors.Default)
					.setTitle('Karaoke event commands:')
					.setDescription(
						[
							'**1.** Join the karaoke queue by running the ``/karaoke join`` slash command.',
							'**2.** Once your turn comes up, you will be invited to become a speaker on the stage.',
							'**3.** After singing, you can either leave the stage by muting your mic, clicking the "Move to audience" button, leaving the stage, or running the ``/karaoke leave`` slash command.'
						].join('\n')
					)
					.addFields(
						{
							name: 'Join',
							value: 'Joins the karaoke queue. User must be in the voice channel or stage.'
						},
						{
							name: 'Duet',
							value: 'Join the queue as a duet. User and partner must be in the voice channel or stage.'
						},
						{ name: 'Leave', value: 'Leaves the queue.' },
						{ name: 'List', value: 'Shows the current karaoke queue.' }
					),
				...formattedEvents
			]
		});
	}

	/**
	 * Sends a confirmation prompt for the partner.
	 * @param channel - The event's text channel
	 * @param memberId - the ID of the member
	 * @param partnerId - The ID of the partner
	 */
	private async duetConfirmation(channel: GuildTextBasedChannel, memberId: string, partnerId: string): Promise<boolean | null> {
		const PromptButtons = {
			Yes: '@kbotdev/karaoke.duet.yes',
			No: '@kbotdev/karaoke.duet.no'
		};

		const message = await channel.send({
			content: userMention(partnerId),
			embeds: [
				new EmbedBuilder()
					.setColor(EmbedColors.Default)
					.setDescription(`Would ${userMention(partnerId)} like to the queue as a duet with ${userMention(memberId)}?`)
					.setFooter({ text: 'This confirmation will timeout in 30 seconds' })
			],
			components: [
				new ActionRowBuilder<ButtonBuilder>()
					.addComponents(
						new ButtonBuilder() //
							.setCustomId(PromptButtons.Yes)
							.setLabel('Yes')
							.setStyle(ButtonStyle.Success)
					)
					.addComponents(
						new ButtonBuilder() //
							.setCustomId(PromptButtons.No)
							.setLabel('No')
							.setStyle(ButtonStyle.Danger)
					)
			],
			allowedMentions: { users: [partnerId] }
		});

		return message
			.awaitMessageComponent({
				filter: (i: ButtonInteraction) => i.user.id === partnerId,
				componentType: ComponentType.Button,
				time: 30000
			})
			.then(async (i) => {
				await message.delete();
				return i.customId === PromptButtons.Yes;
			})
			.catch(() => null);
	}
}
