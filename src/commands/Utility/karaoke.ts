import { EmbedColors } from '#utils/constants';
import { getGuildIds } from '#utils/config';
import { ApplyOptions } from '@sapphire/decorators';
import { ButtonInteraction, MessageActionRow, MessageButton, MessageEmbed } from 'discord.js';
import { isNullish } from '@sapphire/utilities';
import { channelMention, userMention } from '@discordjs/builders';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { ModuleCommand } from '@kbotdev/plugin-modules';
import type { UtilityModule } from '../../modules/UtilityModule';

@ApplyOptions<ModuleCommand.Options>({
	module: 'UtilityModule',
	description: 'Join or leave the karaoke queue',
	preconditions: ['GuildOnly', 'ModuleEnabled'],
	requiredClientPermissions: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks]
})
export class UtilityCommand extends ModuleCommand<UtilityModule> {
	public constructor(context: ModuleCommand.Context, options: ModuleCommand.Options) {
		super(context, { ...options });
		if (Boolean(this.description) && !this.detailedDescription) this.detailedDescription = this.description;
	}

	public override registerApplicationCommands(registry: ModuleCommand.Registry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder //
					.setName('karaoke')
					.setDescription('Join or leave the karaoke queue')
					.addSubcommand((subcommand) =>
						subcommand //
							.setName('help')
							.setDescription('Show info about karaoke commands')
					)
					.addSubcommand((subcommand) =>
						subcommand //
							.setName('list')
							.setDescription('Show the current queue')
					)
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
					),
			{ idHints: ['1038252639810494474'], guildIds: getGuildIds() }
		);
	}

	public async chatInputRun(interaction: ModuleCommand.ChatInputInteraction) {
		switch (interaction.options.getSubcommand(true)) {
			case 'help': {
				return this.chatInputHelp(interaction);
			}
			case 'list': {
				return this.chatInputList(interaction);
			}
			case 'join': {
				return this.chatInputJoin(interaction);
			}
			case 'duet': {
				return this.chatInputDuet(interaction);
			}
			default: {
				return this.chatInputLeave(interaction);
			}
		}
	}

	public async chatInputHelp(interaction: ModuleCommand.ChatInputInteraction) {
		await interaction.deferReply({ ephemeral: true });
		const { karaoke } = this.container;

		const events = await karaoke.repo.fetchEvents(interaction.guildId!);
		const formattedEvents = events
			? events.map((event, index) =>
					new MessageEmbed()
						.setColor(EmbedColors.Default)
						.setDescription(`**Event #${index + 1}** - ${event.id}`)
						.addFields(
							{ name: 'Voice channel', value: channelMention(event.id), inline: true },
							{ name: 'Command channel', value: channelMention(event.channel), inline: true }
						)
			  )
			: [];

		return interaction.editReply({
			embeds: [
				new MessageEmbed()
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

	public async chatInputList(interaction: ModuleCommand.ChatInputInteraction) {
		await interaction.deferReply({ ephemeral: true });
		const { karaoke } = this.container;
		const guildId = interaction.guildId!;

		const eventId = await interaction
			.guild!.members.fetch(interaction.user.id)
			.then((member) => member.voice.channelId)
			.catch(() => null);
		if (isNullish(eventId)) return interaction.defaultReply('You are not in a voice channel.');

		const isActive = await karaoke.repo.isEventActive(guildId, eventId);
		if (!isActive) return interaction.defaultReply('There is no karaoke event to show the list for.');

		const queue = await karaoke.repo.fetchQueue(eventId);
		if (isNullish(queue)) return interaction.defaultReply('There is no queue to show.');

		return interaction.editReply({
			embeds: [karaoke.buildQueueEmbed(queue)]
		});
	}

	public async chatInputJoin(interaction: ModuleCommand.ChatInputInteraction) {
		await interaction.deferReply({ ephemeral: true });
		const { karaoke } = this.container;
		const guildId = interaction.guildId!;

		const member = await interaction.guild!.members.fetch(interaction.user.id);
		const eventId = member.voice.channelId;
		if (isNullish(eventId)) return interaction.defaultReply('You are not in a voice channel.');

		const isActive = await karaoke.repo.isEventActive(guildId, eventId);
		if (!isActive) return interaction.defaultReply('There is no karaoke event to join.');

		const event = await karaoke.repo.fetchEventWithQueue(eventId);
		if (isNullish(event)) return interaction.errorReply("Something went wrong. The bot's dev had been notified of the error.");

		const result = karaoke.isJoinValid(event, event.queue, member.id);
		if (!result.valid) return interaction.errorReply(result.reason!);

		const newQueue = await karaoke.repo.addToQueue(eventId, member.id, member.displayName);
		if (isNullish(newQueue)) return interaction.errorReply('There was an error when adding you to the queue.');

		const embed = karaoke.buildQueueEmbed(newQueue);
		if (newQueue.length === 1) {
			await karaoke.setUserToSinger(interaction.guild!.members, newQueue[0]);
			await interaction.channel!.send({
				content: `${userMention(member.id)} is up!`,
				embeds: [embed],
				allowedMentions: { users: [] }
			});
		}
		return interaction.successReply('You have successfully joined the queue.');
	}

	public async chatInputDuet(interaction: ModuleCommand.ChatInputInteraction) {
		await interaction.deferReply({ ephemeral: true });
		const { karaoke } = this.container;
		const guildId = interaction.guildId!;

		const member = await interaction.guild!.members.fetch(interaction.user.id);
		const eventId = member.voice.channelId;
		if (isNullish(eventId)) return interaction.defaultReply('You are not in a voice channel.');

		const isActive = await karaoke.repo.isEventActive(guildId, eventId);
		if (!isActive) return interaction.defaultReply('There is no karaoke event to join.');

		const event = await karaoke.repo.fetchEventWithQueue(eventId);
		if (isNullish(event)) return interaction.defaultReply("Something went wrong. The bot's dev had been notified of the error.");

		const partner = await interaction.guild!.members.fetch(interaction.options.getUser('partner', true).id);
		const result = karaoke.isJoinValid(event, event.queue, member.id, partner);
		if (!result.valid) return interaction.errorReply(result.reason!);

		const message = await interaction.channel!.send({
			content: userMention(partner.id),
			embeds: [
				new MessageEmbed()
					.setColor(EmbedColors.Default)
					.setDescription(`Would you like to the queue as a duet with <@${member.id}>?\n(This will expire in 30 seconds)`)
			],
			components: [
				new MessageActionRow()
					.addComponents(new MessageButton().setCustomId('yesduet').setLabel('Yes').setStyle('SUCCESS'))
					.addComponents(new MessageButton().setCustomId('noduet').setLabel('No').setStyle('DANGER'))
			],
			allowedMentions: { users: [partner.id] }
		});

		message
			.awaitMessageComponent({
				filter: (i: ButtonInteraction) => i.user.id === partner.id,
				componentType: 'BUTTON',
				time: 30000
			})
			.then(async (i) => {
				if (i.customId === 'yesduet') {
					await message.delete();
					const newQueue = await karaoke.repo.addToQueue(eventId, member.id, member.displayName, partner.id, partner.displayName);
					if (isNullish(newQueue)) return interaction.errorReply('Error when adding member to queue.');

					await interaction.successReply(`Successfully joined queue as a duet with ${userMention(partner.id)}.`);

					const embed = karaoke.buildQueueEmbed(newQueue);
					if (newQueue.length === 1) {
						await interaction.channel!.send({
							content: `${userMention(member.id)} and ${userMention(partner.id)} are up!`,
							embeds: [embed],
							allowedMentions: { users: [] }
						});
					}
					return interaction.channel!.send({
						content: `${userMention(member.id)} and ${userMention(partner.id)} have joined the queue.`,
						embeds: [embed],
						allowedMentions: { users: [] }
					});
				}
				await message.delete();
				return interaction.defaultReply('Your duet partner denied the join request.');
			})
			.catch(async () => {
				await message.delete();
				return interaction.defaultReply("Your duet partner didn't respond to the confirmation.");
			});

		const newQueue = await karaoke.repo.addToQueue(eventId, member.id, member.displayName, partner.id, partner.displayName);
		if (isNullish(newQueue)) return interaction.errorReply('Error when adding member to queue.');

		const embed = karaoke.buildQueueEmbed(newQueue);
		if (newQueue.length === 1) {
			await karaoke.setUserToSinger(interaction.guild!.members, newQueue[0]);
			await interaction.channel!.send({
				content: `${userMention(member.id)} is up!`,
				embeds: [embed],
				allowedMentions: { users: [] }
			});
		}
		return interaction.successReply('Successfully joined queue.');
	}

	public async chatInputLeave(interaction: ModuleCommand.ChatInputInteraction) {
		await interaction.deferReply({ ephemeral: true });
		const { karaoke } = this.container;
		const guildId = interaction.guildId!;

		const member = await interaction.guild!.members.fetch(interaction.user.id);
		const eventId = member.voice.channelId;
		if (isNullish(eventId)) return interaction.defaultReply('You are not in a voice channel.');

		const isActive = await karaoke.repo.isEventActive(guildId, eventId);
		if (!isActive) return interaction.defaultReply('There is no karaoke event to leave from.');

		const queue = await karaoke.repo.fetchQueue(eventId);
		if (isNullish(queue)) return interaction.defaultReply("Something went wrong. The bot's dev had been notified of the error.");

		const userEntry = queue.find((e) => e.id === member.id);
		if (isNullish(userEntry)) return interaction.defaultReply('You are not in the queue.');

		// TODO
		//  check how the user array is sorted in the DB since we can rotate the speaker right away
		if (queue[0].id === member.id || (queue[0].partnerId && queue[0].partnerId === member.id)) {
			await karaoke.setUserToAudience(interaction.guild!.members, queue[0]);
			return interaction.successReply('Successfully left queue.');
		}

		await karaoke.repo.removeFromQueue(eventId, userEntry.id, userEntry.partnerId ?? undefined);
		if (userEntry.partnerId) {
			const ping = member.id === userEntry.id ? userEntry.partnerId : userEntry.id;
			return interaction.channel!.send({
				content: `${userMention(userEntry.id)} & ${userMention(userEntry.partnerId)} have left the queue.`,
				allowedMentions: { users: [ping] }
			});
		}
		return interaction.successReply('Successfully left queue.');
	}
}
