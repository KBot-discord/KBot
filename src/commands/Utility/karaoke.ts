// Imports
import { Subcommand } from '@sapphire/plugin-subcommands';
import { ApplyOptions } from '@sapphire/decorators';
import { ButtonInteraction, MessageActionRow, MessageButton, MessageEmbed } from 'discord.js';
import { isNullish } from '@sapphire/utilities';
import { embedColors } from '../../lib/util/constants';
import { getGuildIds, getIdHints } from '../../lib/util/config';

@ApplyOptions<Subcommand.Options>({
	description: 'Join or leave the karaoke queue',
	subcommands: [
		{ name: 'help', chatInputRun: 'chatInputHelp' },
		{ name: 'list', chatInputRun: 'chatInputList' },
		{ name: 'join', chatInputRun: 'chatInputJoin' },
		{ name: 'duet', chatInputRun: 'chatInputDuet' },
		{ name: 'leave', chatInputRun: 'chatInputLeave' }
	]
})
export class KaraokeCommand extends Subcommand {
	public constructor(context: Subcommand.Context, options: Subcommand.Options) {
		super(context, { ...options });
	}

	public override registerApplicationCommands(registry: Subcommand.Registry) {
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
			{ idHints: getIdHints(this.name), guildIds: getGuildIds() }
		);
	}

	public async chatInputHelp(interaction: Subcommand.ChatInputInteraction) {
		await interaction.deferReply({ ephemeral: true });
		const { karaoke } = this.container;

		const events = await karaoke.fetchEvents(interaction.guildId!);
		const formattedEvents = events
			? events.map((event, index) =>
					new MessageEmbed()
						.setColor(embedColors.default)
						.setDescription(`**Event #${index + 1}** - ${event.id}`)
						.addFields(
							{ name: 'Voice channel', value: `<#${event.id}>`, inline: true },
							{ name: 'Command channel', value: `<#${event.channel}>`, inline: true }
						)
			  )
			: [];

		return interaction.editReply({
			embeds: [
				new MessageEmbed()
					.setColor(embedColors.default)
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

	public async chatInputList(interaction: Subcommand.ChatInputInteraction) {
		await interaction.deferReply({ ephemeral: true });
		const { karaoke } = this.container;

		const eventId = await interaction.guild!.members.fetch(interaction.user.id).then((member) => member.voice.channelId);
		if (isNullish(eventId)) return interaction.defaultReply('You are not in a voice channel.');

		const isActive = await karaoke.isEventActive(eventId);
		if (!isActive) return interaction.defaultReply('There is no karaoke event to leave from.');

		const queue = await karaoke.fetchQueue(eventId);
		if (isNullish(queue)) return interaction.defaultReply('There is no queue.');

		return interaction.editReply({
			embeds: [karaoke.buildQueueEmbed(queue)]
		});
	}

	public async chatInputJoin(interaction: Subcommand.ChatInputInteraction) {
		await interaction.deferReply({ ephemeral: true });
		const { karaoke } = this.container;

		const member = await interaction.guild!.members.fetch(interaction.user.id);
		const eventId = member.voice.channelId;
		if (isNullish(eventId)) return interaction.defaultReply('You are not in a voice channel.');

		const isActive = await karaoke.isEventActive(eventId);
		if (!isActive) return interaction.defaultReply('There is no karaoke event to join.');

		const event = await karaoke.fetchEventWithQueue(eventId);
		if (isNullish(event)) return interaction.defaultReply('Something went wrong.');

		const result = karaoke.isJoinValid(event, event.queue, member.id);
		if (!result.isValid) return interaction.errorReply(result.reason!);

		const newQueue = await karaoke.addToQueue(eventId, member.id, member.displayName);
		if (isNullish(newQueue)) return interaction.errorReply('Error when adding member to queue.');

		const embed = karaoke.buildQueueEmbed(newQueue);
		if (newQueue.length === 1) {
			await member.voice.setSuppressed(false);
			await interaction.channel!.send({
				content: `<@${member.id}> is up!`,
				embeds: [embed],
				allowedMentions: { users: [] }
			});
		}
		return interaction.successReply('Successfully joined queue.');
	}

	public async chatInputDuet(interaction: Subcommand.ChatInputInteraction) {
		await interaction.deferReply({ ephemeral: true });
		const { karaoke } = this.container;

		const member = await interaction.guild!.members.fetch(interaction.user.id);
		const eventId = member.voice.channelId;
		if (isNullish(eventId)) return interaction.defaultReply('You are not in a voice channel.');

		const isActive = await karaoke.isEventActive(eventId);
		if (!isActive) return interaction.defaultReply('There is no karaoke event to join.');

		const event = await karaoke.fetchEventWithQueue(eventId);
		if (isNullish(event)) return interaction.defaultReply('Something went wrong.');

		const partner = await interaction.guild!.members.fetch(interaction.options.getUser('partner', true).id);
		const result = karaoke.isJoinValid(event, event.queue, member.id, partner);
		if (!result.isValid) return interaction.errorReply(result.reason!);

		const message = await interaction.channel!.send({
			content: `<@${partner.id}>`,
			embeds: [
				new MessageEmbed()
					.setColor('#006BFC')
					.setDescription(`Would you like to the queue as a duet with <@${member.id}>?\n(This will expire in 30 seconds)`)
			],
			components: [
				new MessageActionRow()
					.addComponents(new MessageButton().setCustomId('yesduet').setLabel('Yes').setStyle('SUCCESS'))
					.addComponents(new MessageButton().setCustomId('noduet').setLabel('No').setStyle('DANGER'))
			],
			allowedMentions: { users: [partner?.id] }
		});
		const filter = (i: ButtonInteraction) => i.user.id === partner.id;

		message
			.awaitMessageComponent({
				filter,
				componentType: 'BUTTON',
				time: 30000
			})
			.then(async (i) => {
				if (i.customId === 'yesduet') {
					await message.delete();
					const newQueue = await karaoke.addToQueue(eventId, member.id, member.displayName, partner.id, partner.displayName);
					if (isNullish(newQueue)) return interaction.errorReply('Error when adding member to queue.');

					await interaction.successReply(`Successfully joined queue as a duet with <@${partner.id}>.`);

					const embed = karaoke.buildQueueEmbed(newQueue);
					if (newQueue.length === 1) {
						await interaction.channel!.send({
							content: `<@${member.id}> and <@${partner.id}> are up!`,
							embeds: [embed],
							allowedMentions: { users: [] }
						});
					}
					return interaction.channel!.send({
						content: `<@${member.id}> and <@${partner.id}> have joined the queue.`,
						embeds: [embed],
						allowedMentions: { users: [] }
					});
				}
				await message.delete();
				return interaction.defaultReply('Your duet partner denied the join request.');
			})
			.catch(async () => {
				await message.delete();
				return interaction.defaultReply("Your duet partner didn't respond.");
			});

		const newQueue = await karaoke.addToQueue(eventId, member.id, member.displayName, partner.id, partner.displayName);
		if (isNullish(newQueue)) return interaction.errorReply('Error when adding member to queue.');

		const embed = karaoke.buildQueueEmbed(newQueue);
		if (newQueue.length === 1) {
			await member.voice.setSuppressed(false);
			await interaction.channel!.send({
				content: `<@${member.id}> is up!`,
				embeds: [embed],
				allowedMentions: { users: [] }
			});
		}
		return interaction.successReply('Successfully joined queue.');
	}

	public async chatInputLeave(interaction: Subcommand.ChatInputInteraction) {
		await interaction.deferReply({ ephemeral: true });
		const { karaoke } = this.container;

		const member = await interaction.guild!.members.fetch(interaction.user.id);
		const eventId = member.voice.channelId;
		if (isNullish(eventId)) return interaction.defaultReply('You are not in a voice channel.');

		const isActive = await karaoke.isEventActive(eventId);
		if (!isActive) return interaction.defaultReply('There is no karaoke event to leave from.');

		const queue = await karaoke.fetchQueue(eventId);
		if (isNullish(queue)) return interaction.defaultReply('Something went wrong.');

		const userEntry = queue.find((e) => e.id === member.id);
		if (isNullish(userEntry)) return interaction.defaultReply('You are not in the queue.');

		// TODO
		//  check how the user array is sorted in the DB since we can rotate the speaker right away
		if (queue[0].id === member.id || (queue[0].partnerId && queue[0].partnerId === member.id)) {
			await karaoke.setUserToAudience(interaction.guild!.members, queue[0]);
			return interaction.successReply('Successfully left queue.');
		}

		await karaoke.removeFromQueue(eventId, userEntry.id, userEntry.partnerId ?? undefined);
		if (userEntry.partnerId) {
			const ping = member.id === userEntry.id ? userEntry.partnerId : userEntry.id;
			return interaction.channel!.send({
				content: `<@${userEntry.id}> & <@${userEntry.partnerId}> have left the queue.`,
				allowedMentions: { users: [ping] }
			});
		}
		return interaction.successReply('Successfully left queue.');
	}
}
