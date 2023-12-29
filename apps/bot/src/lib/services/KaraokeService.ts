import { fetchChannel } from '#lib/utilities/discord';
import { isNullOrUndefined } from '#lib/utilities/functions';
import { EmbedColors, KBotEmoji } from '#lib/utilities/constants';
import { ResultClass } from '#lib/structures/ResultClass';
import { DiscordFetchError } from '#lib/structures/errors/DiscordFetchError';
import { ChannelType, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { Result, container } from '@sapphire/framework';
import { roleMention, userMention } from '@discordjs/builders';
import type { Guild, GuildMember, GuildTextBasedChannel, Message, VoiceBasedChannel } from 'discord.js';
import type { KaraokeEvent, KaraokeUser, PrismaClient } from '@prisma/client';
import type {
	AddToQueueData,
	CreateEventData,
	CreateScheduledEventData,
	KaraokeEventWithUsers,
	RemoveFromQueueData,
	UpdateEventData
} from '#lib/services/types/karaoke';

export class KaraokeService extends ResultClass {
	private readonly database: PrismaClient;

	public constructor() {
		super();

		this.database = container.prisma;
	}

	/**
	 * Get a karaoke event.
	 * @param eventId - The ID of the karaoke event
	 */
	public async getEvent(eventId: string): Promise<KaraokeEvent | null> {
		return await this.database.karaokeEvent.findUnique({
			where: { id: eventId }
		});
	}

	/**
	 * Get a karaoke event with its queue.
	 * @param eventId - The ID of the karaoke event
	 */
	public async getEventWithQueue(eventId: string): Promise<(KaraokeEvent & { queue: KaraokeUser[] }) | null> {
		return await this.database.karaokeEvent.findUnique({
			where: { id: eventId },
			include: { queue: { orderBy: { createdAt: 'asc' } } }
		});
	}

	/**
	 * Get all the karaoke events of a guild.
	 * @param guildId - The ID of the guild
	 */
	public async getEventByGuild(guildId: string): Promise<KaraokeEvent[]> {
		return await this.database.karaokeEvent.findMany({
			where: { guildId }
		});
	}

	/**
	 * Delete a karaoke event.
	 * @param eventId - The ID of the karaoke event
	 */
	public async deleteEvent(eventId: string): Promise<KaraokeEvent | null> {
		return await this.database.karaokeEvent
			.delete({
				where: { id: eventId }
			})
			.catch(() => null);
	}

	/**
	 * Create a karaoke event.
	 * @param data - The data to create the karaoke event
	 */
	public async createEvent(data: CreateEventData): Promise<KaraokeEvent> {
		const { id, guildId, textChannelId, pinMessageId } = data;

		return await this.database.karaokeEvent.create({
			data: {
				id,
				textChannelId,
				locked: false,
				isActive: true,
				pinMessageId,
				eventSettings: { connect: { guildId } }
			}
		});
	}

	/**
	 * Create a scheduled karaoke event.
	 * @param data - The data to create the scheduled karaoke event
	 */
	public async createScheduledEvent(data: CreateScheduledEventData): Promise<KaraokeEvent> {
		const { id, guildId, textChannelId, discordEventId, roleId } = data;

		return await this.database.karaokeEvent.create({
			data: {
				id,
				textChannelId,
				locked: false,
				isActive: false,
				discordEventId,
				roleId,
				eventSettings: { connect: { guildId } }
			}
		});
	}

	/**
	 * Update a karaoke event.
	 * @param data - The data to update the karaoke event
	 */
	public async updateEvent(data: UpdateEventData): Promise<KaraokeEvent> {
		const { id, textChannelId, locked, isActive, discordEventId, roleId } = data;

		return await this.database.karaokeEvent.update({
			where: { id },
			data: { textChannelId, locked, isActive, discordEventId, roleId }
		});
	}

	/**
	 * Get a count of the total amount of karaoke events.
	 */
	public async countEvents(): Promise<number> {
		return await this.database.karaokeEvent.count();
	}

	/**
	 * Get the total count of karaoke events in a guild.
	 * @param guildId - The ID of the guild
	 */
	public async countEventsByGuild(guildId: string): Promise<number> {
		return await this.database.karaokeEvent.count({
			where: { guildId }
		});
	}

	/**
	 * Add a user to a karaoke event queue.
	 * @param eventId - The ID of the karaoke event
	 * @param data - The data to add the user to the queue
	 */
	public async addUserToQueue(eventId: string, data: AddToQueueData): Promise<KaraokeEvent & { queue: KaraokeUser[] }> {
		const { id, name, partnerId, partnerName } = data;

		const result = await this.database.karaokeUser.create({
			data: { id, name, partnerId, partnerName, karaokeEvent: { connect: { id: eventId } } },
			include: {
				karaokeEvent: {
					include: { queue: { orderBy: { createdAt: 'asc' } } }
				}
			}
		});

		return result.karaokeEvent;
	}

	/**
	 * Remove a user from a karaoke event queue.
	 * @param eventId - The ID of the karaoke event
	 * @param data - The data to remove the user from the queue
	 */
	public async removeUserFromQueue(eventId: string, data: RemoveFromQueueData): Promise<KaraokeEvent & { queue: KaraokeUser[] }> {
		const { id } = data;

		const result = await this.database.karaokeUser.delete({
			where: { id_eventId: { id, eventId } },
			include: {
				karaokeEvent: {
					include: { queue: { orderBy: { createdAt: 'asc' } } }
				}
			}
		});

		return result.karaokeEvent;
	}

	/**
	 * Set a user to be the karaoke event singer.
	 * @param user - The user to set to singer
	 * @param partner - If it is a duet, the user's partner
	 */
	public async setUserToSinger(user: GuildMember, partner?: GuildMember): Promise<void> {
		await this.muteUsers(false, { user, partner });
	}

	/**
	 * Set a user to the karaoke event audience.
	 * @param user - The user to set to the audience
	 * @param partner - If it is a duet, the user's partner
	 */
	public async setUserToAudience(user: GuildMember, partner?: GuildMember): Promise<void> {
		await this.muteUsers(true, { user, partner });
	}

	/**
	 * Rotate the karaoke queue.
	 * @param guild - The guild the karaoke event is in
	 * @param event - The karaoke event
	 * @param textChannel - The text channel
	 */
	public async rotateQueue(
		guild: Guild, //
		event: KaraokeEventWithUsers,
		textChannel: GuildTextBasedChannel
	): Promise<void> {
		const { current, next } = await this.fetchEventUsers(guild, event.queue);

		const [currentUser, currentPartner] = current;
		const [nextUser, nextPartner] = next;

		const updatedEvent = await this.rotate(
			event, //
			{ user: currentUser, partner: currentPartner },
			{ user: nextUser, partner: nextPartner }
		);

		const { result } = await container.validator.channels.canSendEmbeds(textChannel);
		if (isNullOrUndefined(textChannel) || !result) return;

		let done = userMention(currentUser.id);
		let nextMention = nextUser ? `${userMention(nextUser.id)} is` : undefined;
		const mentions: string[] = nextUser ? [nextUser.id] : [];

		if (currentPartner?.id) {
			done = `${userMention(currentUser.id)} and ${userMention(currentPartner.id)}`;
		}

		if (nextUser && nextPartner) {
			nextMention = `${userMention(nextUser.id)} & ${userMention(nextPartner.id)} are`;
			mentions.push(nextPartner.id);
		}

		const content = nextMention //
			? `${done}'s turn is over.\n\n${nextMention} up next!`
			: `${done}'s turn is over.`;

		await this.sendEmbed(textChannel, updatedEvent, content, mentions);
	}

	/**
	 * Skip the current singer.
	 * @param guild - The guild the karaoke event is in
	 * @param event - The karaoke event
	 * @param textChannel - The text channel
	 * @param moderatorId - The ID of the user that triggered the skip
	 */
	public async skipQueue(
		guild: Guild, //
		event: KaraokeEventWithUsers,
		textChannel: GuildTextBasedChannel,
		moderatorId: string
	): Promise<void> {
		const { current, next } = await this.fetchEventUsers(guild, event.queue);

		const [currentUser, currentPartner] = current;
		const [nextUser, nextPartner] = next;

		const updatedEvent = await this.rotate(
			event, //
			{ user: currentUser, partner: currentPartner },
			{ user: nextUser, partner: nextPartner }
		);

		const { result } = await container.validator.channels.canSendEmbeds(textChannel);
		if (isNullOrUndefined(textChannel) || !result) return;

		let done = `${userMention(currentUser.id)} has been skipped by ${userMention(moderatorId)}`;
		let nextMention = nextUser ? `${userMention(nextUser.id)} is` : undefined;
		const mentions: string[] = nextUser ? [nextUser.id] : [];

		if (currentPartner) {
			done = `${userMention(currentUser.id)} & ${userMention(currentPartner.id)} have been skipped by ${userMention(moderatorId)}`;
		}

		if (nextUser && nextPartner) {
			nextMention = `${userMention(nextUser.id)} & ${userMention(nextPartner.id)} are`;
			mentions.push(nextPartner.id);
		}

		const content = nextMention //
			? `${done}\n\n${nextMention} up next!`
			: done;

		await this.sendEmbed(textChannel, updatedEvent, content, mentions);
	}

	/**
	 * Remove a user from the karaoke event queue. This is for event management.
	 * @param guild - The guild the karaoke event is in
	 * @param event - The karaoke event
	 * @param textChannel - The text channel
	 * @param moderatorId - The ID of the user that triggered the removal
	 */
	public async forceRemoveUserFromQueue(
		guild: Guild,
		event: KaraokeEventWithUsers,
		textChannel: GuildTextBasedChannel,
		moderatorId: string
	): Promise<void> {
		const { current, next } = await this.fetchEventUsers(guild, event.queue);

		const [currentUser, currentPartner] = current;
		const [nextUser, nextPartner] = next;

		const updatedEvent = await this.rotate(
			event, //
			{ user: currentUser, partner: currentPartner },
			{ user: nextUser, partner: nextPartner }
		);

		let done = `${userMention(currentUser.id)} has been removed from the queue by ${userMention(moderatorId)}`;
		let nextMention = nextUser ? `${userMention(nextUser.id)} is` : undefined;
		const mentions: string[] = nextUser ? [nextUser.id] : [];

		if (currentPartner) {
			done = `${userMention(currentUser.id)} & ${userMention(currentPartner.id)} have been removed from the queue by ${userMention(moderatorId)}`;
		}

		if (nextUser && nextPartner) {
			nextMention = `${userMention(nextUser.id)} & ${userMention(nextPartner.id)} are`;
			mentions.push(nextPartner.id);
		}

		const content = nextMention //
			? `${done}\n\n${nextMention} up next!`
			: done;

		await this.sendEmbed(textChannel, updatedEvent, content, mentions);
	}

	/**
	 * Check if a user is eligible to join a karaoke event queue.
	 * @param event - The event to check
	 * @param userId - The ID of the user to check
	 * @param partner - If a duet, the {@link GuildMember} object of the parter
	 */
	public isJoinValid(
		event: KaraokeEventWithUsers,
		userId: string,
		partner?: GuildMember
	): { valid: false; reason: string } | { valid: true; reason?: undefined } {
		if (event.locked) {
			return { valid: false, reason: 'The karaoke queue is locked.' };
		}
		if (event.queue.length > 50) {
			return { valid: false, reason: 'Queue limit of 50 people has been reached.' };
		}
		if (userId === partner?.id) {
			return { valid: false, reason: 'You cannot duet with yourself.' };
		}
		if (partner && (!partner.voice.channelId || partner.voice.channelId !== event.id)) {
			return {
				valid: false,
				reason: `Tell your partner to please join the stage, then run this command again.\n\n**Stage:** <#${event.id}>`
			};
		}
		if (event.queue.some((member) => member.id === userId)) {
			return { valid: false, reason: 'You are already in queue.' };
		}
		if (partner && event.queue.some((member) => member.id === partner.id)) {
			return { valid: false, reason: 'You or your partner are already in the queue.' };
		}
		return { valid: true };
	}

	/**
	 * Check if a user is eligible to be added to a karaoke event queue.
	 * @param event - The event to check
	 * @param userId - The ID of the user to check
	 */
	public isAddValid(event: KaraokeEventWithUsers, userId: string): { valid: false; reason: string } | { valid: true; reason?: undefined } {
		if (event.queue.length > 50) {
			return { valid: false, reason: 'Queue limit of 50 people has been reached.' };
		}
		if (event.queue.some((member) => member.id === userId)) {
			return { valid: false, reason: 'User is already in the queue.' };
		}
		return { valid: true };
	}

	/**
	 * Start a karaoke event.
	 * @param guild - The guild that the event is in
	 * @param voiceChannel - The voice channel of the event
	 * @param textChannel - The text channel of the event
	 * @param data - The data to start the event
	 */
	public async startEvent(
		voiceChannel: VoiceBasedChannel,
		textChannel: GuildTextBasedChannel,
		data: {
			stageTopic?: string | null;
			roleId?: string | null;
		}
	): Promise<Result<KaraokeEvent, Error>> {
		const { events, validator } = container;

		return await Result.fromAsync(async () => {
			const eventName = data.stageTopic ?? 'Karaoke Event';
			const baseEmbed = events.karaokeInstructionsEmbed(voiceChannel.id);
			const embed = await this.setupVoiceChannel(baseEmbed, voiceChannel, eventName);

			const message = await this.sendAnnouncement(embed, textChannel, data.roleId);

			if (message && !textChannel.isVoiceBased()) {
				const canPin = await validator.client.hasChannelPermissions(textChannel, [PermissionFlagsBits.ManageMessages]);
				if (canPin) await message.pin();
			}

			return await this.createEvent({
				id: voiceChannel.id,
				guildId: voiceChannel.guildId,
				textChannelId: textChannel.id,
				pinMessageId: textChannel.isVoiceBased() ? undefined : message?.id
			});
		});
	}

	/**
	 * Schedule a karaoke event.
	 * @param guild - The guild that the event is in
	 * @param event - The data of the event
	 * @param stageTopic - The topic of the stage
	 */
	public async startScheduledEvent(event: KaraokeEvent, stageTopic: string): Promise<Result<KaraokeEvent, Error>> {
		const { events, validator } = container;

		return await Result.fromAsync(async () => {
			const [eventChannel, textChannel] = await this.fetchEventChannels(event.id, event.textChannelId);

			const baseEmbed = events.karaokeInstructionsEmbed(event.id);
			const embed = await this.setupVoiceChannel(baseEmbed, eventChannel, stageTopic);

			const message = await this.sendAnnouncement(embed, textChannel, event.roleId);

			if (message && !textChannel.isVoiceBased()) {
				const canPin = await validator.client.hasChannelPermissions(textChannel, [PermissionFlagsBits.ManageMessages]);
				if (canPin) await message.pin();
			}

			return await this.updateEvent({
				id: event.id,
				textChannelId: textChannel.id,
				isActive: true,
				locked: false,
				discordEventId: null,
				roleId: null,
				pinMessageId: message?.id
			});
		});
	}

	/**
	 * End a karaoke event.
	 * @param guild - The guild that the event is in
	 * @param event - The even to end
	 */
	public async endEvent(event: KaraokeEvent): Promise<Result<undefined, Error>> {
		const { validator } = container;

		return await Result.fromAsync(async () => {
			const [eventChannel, textChannel] = await this.fetchEventChannels(event.id, event.textChannelId);

			if (eventChannel.type === ChannelType.GuildStageVoice && eventChannel.stageInstance) {
				await eventChannel.stageInstance.delete();
			} else {
				const canMute = await validator.client.hasChannelPermissions(eventChannel, [PermissionFlagsBits.MuteMembers]);
				if (canMute) {
					await Promise.allSettled(
						eventChannel.members //
							.filter((member) => member.voice.serverMute)
							.map(async (member) => await member.voice.setMute(false))
					);
				}
			}

			if (event.pinMessageId && !textChannel.isVoiceBased()) {
				const canUnpin = await validator.client.hasChannelPermissions(textChannel, [PermissionFlagsBits.ManageMessages]);
				if (canUnpin) {
					const message = await textChannel.messages.fetch(event.pinMessageId);
					await message.unpin().catch(() => null);
				}
			}

			await this.deleteEvent(event.id);

			return this.ok();
		});
	}

	/**
	 * Build the queue embed for a karaoke event.
	 * @param event - The karaoke event to build the embed for
	 */
	public buildQueueEmbed(event: KaraokeEventWithUsers): EmbedBuilder {
		const { queue } = event;

		const footerText = `Queue lock: ${event.locked ? KBotEmoji.Locked : KBotEmoji.Unlocked} | Size ${queue.length}/50`;

		const embed = new EmbedBuilder() //
			.setColor(EmbedColors.Default)
			.setAuthor({ name: `${KBotEmoji.Microphone} Karaoke queue` })
			.setFooter({ text: footerText });

		if (queue.length === 0) {
			return embed.setTitle('Queue is empty');
		}

		embed.setTitle(`Current singer: ${queue[0].name}`);

		if (queue.length > 1) {
			const description = queue.map((entry, index) => `**${index}.** ${entry.name}`);
			description.shift();
			embed.setDescription(description.join('\n'));
		}
		return embed;
	}

	public async rotate(
		event: KaraokeEventWithUsers,
		current: { user: GuildMember; partner?: GuildMember },
		next: { user?: GuildMember; partner?: GuildMember }
	): Promise<KaraokeEventWithUsers> {
		const { queue } = event;

		await this.removeUserFromQueue(event.id, {
			id: current.user.id,
			partnerId: current.partner?.id
		});

		await this.setUserToAudience(current.user, current.partner);

		if (next.user) {
			await this.setUserToSinger(next.user, next.partner);
		}

		queue.shift();
		return event;
	}

	/**
	 * Mute or unmute users.
	 * @param shouldMute - If the users should be muted
	 * @param data - The user and, if applicable, the partner to mute.
	 */
	private async muteUsers(shouldMute: boolean, data: { user: GuildMember; partner?: GuildMember }): Promise<void> {
		const { user, partner } = data;

		if (user.voice.channel) {
			if (user.voice.channel.type === ChannelType.GuildStageVoice) {
				await user.voice.setSuppressed(shouldMute).catch((error) => {
					container.logger.sentryError(error, { context: user });
				});
			} else {
				await user.voice.setMute(shouldMute).catch((error) => {
					container.logger.sentryError(error, { context: user });
				});
			}
		}

		if (partner?.voice.channel) {
			if (partner.voice.channel.type === ChannelType.GuildStageVoice) {
				await partner.voice.setSuppressed(shouldMute).catch((error) => {
					container.logger.sentryError(error, { context: partner });
				});
			} else {
				await partner.voice.setMute(shouldMute).catch((error) => {
					container.logger.sentryError(error, { context: partner });
				});
			}
		}
	}

	/**
	 * Send a karaoke event message to a channel.
	 * @param textChannel - The channel to sent the embed to
	 * @param event - The karaoke event
	 * @param content - The message to send
	 * @param mentions - The IDs of the users to mention
	 */
	private async sendEmbed(textChannel: GuildTextBasedChannel, event: KaraokeEventWithUsers, content: string, mentions: string[]): Promise<void> {
		const embed = this.buildQueueEmbed(event);

		await textChannel.send({
			content,
			embeds: [embed],
			allowedMentions: { users: mentions }
		});
	}

	/**
	 * Send the karaoke event announcement to a channel.
	 * @param embed - The {@link EmbedBuilder} for the announcement
	 * @param textChannel - The channel to send the announcement to
	 * @param roleId - The ID of the role to ping
	 */
	private async sendAnnouncement(embed: EmbedBuilder, textChannel: GuildTextBasedChannel, roleId?: string | null): Promise<Message | null> {
		return await textChannel
			.send({
				content: `${roleId ? roleMention(roleId) : ''} A karaoke event has started!`,
				embeds: [embed],
				allowedMentions: { roles: roleId ? [roleId] : [] }
			})
			.catch(() => null);
	}

	/**
	 * Sets up the stage or voice channel of the karaoke event.
	 * @param embed - The {@link EmbedBuilder} for the announcement
	 * @param voiceChannel - The voice channel
	 * @param stageTopic - If its a stage channel, the topic of the stage
	 */
	private async setupVoiceChannel(embed: EmbedBuilder, voiceChannel: VoiceBasedChannel, stageTopic: string): Promise<EmbedBuilder> {
		if (voiceChannel.type === ChannelType.GuildStageVoice) {
			if (isNullOrUndefined(voiceChannel.stageInstance)) {
				embed.setTitle(`Event: ${stageTopic}`);
				await voiceChannel.createStageInstance({ topic: stageTopic });
			} else {
				embed.setTitle(`Event: ${voiceChannel.stageInstance.topic}`);
			}
		} else {
			embed.setTitle('Event: Karaoke Event');

			if (voiceChannel.members.size > 0) {
				await Promise.allSettled(
					voiceChannel.members.map(async (member) => await member.voice.setMute(true)) //
				);
			}
		}

		return embed;
	}

	/**
	 * Fetch the channels for a karaoke event.
	 * @param guild - The guild of the karaoke event
	 * @param voiceChannelId - The ID of the voice channel
	 * @param textChannelId - The ID of the text channel
	 */
	private async fetchEventChannels(voiceChannelId: string, textChannelId: string): Promise<[VoiceBasedChannel, GuildTextBasedChannel]> {
		const eventChannel = await fetchChannel<VoiceBasedChannel>(voiceChannelId);
		if (!eventChannel) {
			throw new DiscordFetchError({
				message: 'Failed to fetch event voice channel',
				resourceId: voiceChannelId
			});
		}

		const textChannel = await fetchChannel<GuildTextBasedChannel>(textChannelId);
		if (!textChannel) {
			throw new DiscordFetchError({
				message: 'Failed to fetch event text channel',
				resourceId: textChannelId
			});
		}

		return [eventChannel, textChannel];
	}

	/**
	 * Fetch the user for a karaoke event.
	 * @param guild - The guild that the event is in
	 * @param queue - The event's queue
	 */
	private async fetchEventUsers(
		guild: Guild,
		queue: KaraokeUser[]
	): Promise<{ current: [GuildMember, GuildMember | undefined]; next: [GuildMember | undefined, GuildMember | undefined] }> {
		const currentUserId = queue.at(0)!.id;
		const currentPartnerId = queue.at(0)?.partnerId;
		const nextUserId = queue.at(1)?.id;
		const nextPartnerId = queue.at(1)?.partnerId;

		const currentUser = await guild.members.fetch(currentUserId);
		const currentPartner = currentPartnerId ? await guild.members.fetch(currentPartnerId) : undefined;

		const nextUser = nextUserId ? await guild.members.fetch(nextUserId) : undefined;
		const nextPartner = nextPartnerId ? await guild.members.fetch(nextPartnerId) : undefined;

		return {
			current: [currentUser, currentPartner],
			next: [nextUser, nextPartner]
		};
	}
}
