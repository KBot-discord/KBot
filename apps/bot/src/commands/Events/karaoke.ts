import { EmbedColors } from '#utils/constants';
import { KBotCommand, KBotCommandOptions } from '#extensions/KBotCommand';
import { ApplyOptions } from '@sapphire/decorators';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder } from 'discord.js';
import { isNullish } from '@sapphire/utilities';
import { channelMention, userMention } from '@discordjs/builders';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { ModuleCommand } from '@kbotdev/plugin-modules';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import type { EventModule } from '#modules/EventModule';
import type { ButtonInteraction, GuildTextBasedChannel } from 'discord.js';

@ApplyOptions<KBotCommandOptions>({
	module: 'EventModule',
	description: 'Join or leave the karaoke queue.',
	preconditions: ['ModuleEnabled'],
	requiredClientPermissions: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks],
	runIn: [CommandOptionsRunTypeEnum.GuildAny],
	deferOptions: { defer: true, ephemeral: true },
	helpEmbed: (builder) => {
		return builder //
			.setName('Karaoke')
			.setDescription('Join or leave the karaoke queue.')
			.setSubcommands([
				{ label: '/karaoke join', description: 'Join the queue' }, //
				{ label: '/karaoke duet <partner>', description: 'Join queue as a duet' },
				{ label: '/karaoke leave', description: 'Leave the queue' },
				{ label: '/karaoke queue', description: 'Show the current queue' },
				{ label: '/karaoke help', description: 'Show info about karaoke commands' }
			]);
	}
})
export class EventsCommand extends KBotCommand<EventModule> {
	public constructor(context: ModuleCommand.Context, options: KBotCommandOptions) {
		super(context, { ...options });
	}

	public disabledMessage = (moduleFullName: string): string => {
		return `[${moduleFullName}] The module for this command is disabled.\nYou, or a moderator, can run \`/events toggle\` to enable it.`;
	};

	public override registerApplicationCommands(registry: ModuleCommand.Registry) {
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
							.setDescription('Join queue as a duet')
							.addUserOption((option) =>
								option //
									.setName('partner')
									.setDescription('Partner for your duet')
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
				guildIds: this.container.config.discord.devServers
			}
		);
	}

	public async chatInputRun(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
		switch (interaction.options.getSubcommand(true)) {
			case 'join': {
				return this.chatInputJoin(interaction);
			}
			case 'duet': {
				return this.chatInputDuet(interaction);
			}
			case 'leave': {
				return this.chatInputLeave(interaction);
			}
			case 'queue': {
				return this.chatInputQueue(interaction);
			}
			case 'help': {
				return this.chatInputHelp(interaction);
			}
			default: {
				this.container.logger.fatal(`[${this.name}] Hit default switch in`);
				return interaction.errorReply('Something went wrong.');
			}
		}
	}

	public async chatInputJoin(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
		const { karaoke } = this.module;
		const { guildId, member } = interaction;

		const eventId = member.voice.channelId;
		if (isNullish(eventId)) {
			return interaction.defaultReply('You are not in a voice channel.');
		}

		const active = await karaoke.eventActive({ guildId, eventId });
		if (!active) {
			return interaction.defaultReply('There is no karaoke event to join.');
		}

		const event = await karaoke.getEventWithQueue({ eventId });
		if (isNullish(event)) {
			return interaction.errorReply("Something went wrong. The bot's dev had been notified of the error.");
		}

		const { valid, reason } = karaoke.isJoinValid(event, member.id);
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
			const textChannel = (await interaction.guild.channels.fetch(eventId)) as GuildTextBasedChannel | null;

			if (!textChannel) {
				return interaction.defaultReply('Something went wrong.');
			}

			await textChannel.send({
				content: `${userMention(member.id)} is up!`,
				embeds: [karaoke.buildQueueEmbed(updatedEvent)],
				allowedMentions: { users: [] }
			});
		}

		return interaction.successReply('You have successfully joined the queue.');
	}

	public async chatInputDuet(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
		const { karaoke } = this.module;
		const { guildId, member } = interaction;

		const eventId = member.voice.channelId;
		if (isNullish(eventId)) {
			return interaction.defaultReply('You are not in a voice channel.');
		}

		const active = await karaoke.eventActive({ guildId, eventId });
		if (!active) {
			return interaction.defaultReply('There is no karaoke event to join.');
		}

		const partner = interaction.options.getMember('partner');
		if (isNullish(partner)) {
			return interaction.defaultReply('That user is not in this server.');
		}

		const event = await karaoke.getEventWithQueue({ eventId });
		if (isNullish(event)) {
			return interaction.defaultReply("Something went wrong. The bot's dev had been notified of the error.");
		}

		const { valid, reason } = karaoke.isJoinValid(event, member.id, partner);
		if (!valid) {
			return interaction.errorReply(reason);
		}

		const textChannel = (await interaction.guild.channels.fetch(event.textChannelId)) as GuildTextBasedChannel;

		const response = await this.duetConfirmation(textChannel, member.id, partner.id);
		if (isNullish(response)) {
			return interaction.defaultReply("Your duet partner didn't respond to the confirmation.");
		} else if (!response) {
			return interaction.defaultReply('Your duet partner denied the join request.');
		}

		await interaction.successReply(`Successfully joined queue as a duet with ${userMention(partner.id)}.`);

		const updatedEvent = await karaoke.addUserToQueue(
			{ eventId },
			{
				id: member.id,
				name: member.displayName,
				partnerId: partner.id,
				partnerName: partner.displayName
			}
		);

		if (updatedEvent.queue.length === 1) {
			await karaoke.setUserToSinger(interaction.guild.members, updatedEvent.queue[0]);

			await textChannel!.send({
				content: `${userMention(member.id)} & ${userMention(partner.id)} are up!`,
				embeds: [karaoke.buildQueueEmbed(updatedEvent)],
				allowedMentions: { users: [] }
			});
		}

		return interaction.successReply('Successfully joined queue.');
	}

	public async chatInputLeave(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
		const { karaoke } = this.module;
		const { member } = interaction;

		const eventId = member.voice.channelId;
		if (isNullish(eventId)) {
			return interaction.defaultReply('You are not in a voice channel.');
		}

		const active = await karaoke.eventActive({ guildId: interaction.guildId, eventId });
		if (!active) {
			return interaction.defaultReply('There is no karaoke event to leave from.');
		}

		const event = await karaoke.getEventWithQueue({ eventId });
		if (isNullish(event)) {
			return interaction.defaultReply("Something went wrong. The bot's dev had been notified of the error.");
		}

		const userEntry = event.queue.find((entry) => entry.id === member.id || entry.partnerId === member.id);
		if (isNullish(userEntry)) {
			return interaction.defaultReply('You are not in the queue.');
		}

		const textChannel = (await interaction.guild.channels.fetch(eventId)) as GuildTextBasedChannel | null;
		if (!textChannel) {
			return interaction.defaultReply('Something went wrong.');
		}

		if (event.queue[0].id === member.id || event.queue[0].partnerId === member.id) {
			await karaoke.rotateQueue(interaction.guild.members, event, textChannel);
		} else {
			await karaoke.removeUserFromQueue({ eventId }, { id: userEntry.id, partnerId: userEntry.partnerId ?? undefined });

			if (userEntry.partnerId) {
				const ping = member.id === userEntry.id ? userEntry.partnerId : userEntry.id;

				await textChannel.send({
					content: `${userMention(userEntry.id)} & ${userMention(userEntry.partnerId)} have left the queue.`,
					allowedMentions: { users: [ping] }
				});
			}
		}

		return interaction.defaultReply('Successfully left queue.');
	}

	public async chatInputQueue(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
		const { guildId } = interaction;
		const { karaoke } = this.module;

		const eventId = interaction.member.voice.channelId;

		if (isNullish(eventId)) {
			return interaction.defaultReply('You are not in a voice channel.');
		}

		const active = await karaoke.eventActive({ guildId, eventId });
		if (!active) {
			return interaction.defaultReply('There is no karaoke event to show the queue for.');
		}

		const event = await karaoke.getEventWithQueue({ eventId });
		if (isNullish(event)) {
			return interaction.defaultReply('There is no event to show.');
		}

		return interaction.editReply({
			embeds: [karaoke.buildQueueEmbed(event)]
		});
	}

	// TODO improve help embed
	public async chatInputHelp(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
		const { karaoke } = this.module;

		const events = await karaoke.getEventByGuild({ guildId: interaction.guildId });
		const formattedEvents =
			events.length === 0
				? []
				: events.map((event, index) =>
						new EmbedBuilder()
							.setColor(EmbedColors.Default)
							.setDescription(`**Event #${index + 1}** - ${event.id}`)
							.addFields(
								{ name: 'Voice channel', value: channelMention(event.id), inline: true },
								{ name: 'Command channel', value: channelMention(event.textChannelId), inline: true }
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
						{ name: 'Join', value: 'Joins the karaoke queue. User must be in the voice channel or stage.' },
						{ name: 'Duet', value: 'Join the queue as a duet. User and partner must be in the voice channel or stage.' },
						{ name: 'Leave', value: 'Leaves the queue.' },
						{ name: 'List', value: 'Shows the current karaoke queue.' }
					),
				...formattedEvents
			]
		});
	}

	private async duetConfirmation(channel: GuildTextBasedChannel, memberId: string, partnerId: string): Promise<boolean | null> {
		const message = await channel.send({
			content: userMention(partnerId),
			embeds: [
				new EmbedBuilder()
					.setColor(EmbedColors.Default)
					.setDescription(
						`Would ${userMention(partnerId)} like to the queue as a duet with ${userMention(memberId)}?\n(This will expire in 30 seconds)`
					)
			],
			components: [
				new ActionRowBuilder<ButtonBuilder>()
					.addComponents(
						new ButtonBuilder() //
							.setCustomId('@kbotdev/karaoke.duet.yes')
							.setLabel('Yes')
							.setStyle(ButtonStyle.Success)
					)
					.addComponents(
						new ButtonBuilder() //
							.setCustomId('@kbotdev/karaoke.duet.no')
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
				return i.customId === '@kbotdev/karaoke.duet.yes';
			})
			.catch(() => null);
	}
}
