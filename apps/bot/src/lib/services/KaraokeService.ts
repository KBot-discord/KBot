import { EmbedColors, KBotEmoji } from '#utils/constants';
import { isNullOrUndefined } from '#utils/functions';
import { DiscordFetchError } from '#structures/errors';
import { ResultClass } from '#structures/ResultClass';
import { ChannelType, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { Result, container } from '@sapphire/framework';
import { roleMention, userMention } from '@discordjs/builders';
import { KaraokeRepository } from '@kbotdev/database';
import type {
	AddToQueueData,
	CreateEventData,
	CreateScheduledEventData,
	KaraokeEvent,
	KaraokeEventId,
	KaraokeEventWithUsers,
	KaraokeUser,
	RemoveFromQueueData,
	UpdateEventData
} from '@kbotdev/database';
import type { Guild, GuildMember, GuildMemberManager, GuildTextBasedChannel, Message, VoiceBasedChannel } from 'discord.js';

export class KaraokeService extends ResultClass {
	private readonly repository: KaraokeRepository;

	public constructor() {
		super();

		this.repository = new KaraokeRepository({
			database: container.prisma
		});
	}

	public async getEvent(eventId: string): Promise<KaraokeEvent | null> {
		return this.repository.getEvent({ eventId });
	}

	public async getEventWithQueue(eventId: string): Promise<(KaraokeEvent & { queue: KaraokeUser[] }) | null> {
		return this.repository.getEventWithQueue({ eventId });
	}

	public async getEventByGuild(guildId: string): Promise<KaraokeEvent[]> {
		return this.repository.getEventByGuild({ guildId });
	}

	public async deleteEvent(eventId: string): Promise<KaraokeEvent | null> {
		return this.repository.deleteEvent({ eventId });
	}

	public async updateQueueLock(eventId: string, isLocked: boolean): Promise<KaraokeEvent> {
		return this.repository.updateQueueLock({ eventId }, isLocked);
	}

	public async createEvent(data: CreateEventData): Promise<KaraokeEvent> {
		return this.repository.createEvent(data);
	}

	public async createScheduledEvent(data: CreateScheduledEventData): Promise<KaraokeEvent> {
		return this.repository.createScheduledEvent(data);
	}

	public async updateEvent(data: UpdateEventData): Promise<KaraokeEvent> {
		return this.repository.updateEvent(data);
	}

	public async countEvents(): Promise<number> {
		return this.repository.countEvents();
	}

	public async countEventsByGuild(guildId: string): Promise<number> {
		return this.repository.countEventsByGuild({ guildId });
	}

	public async addUserToQueue(
		{ eventId }: KaraokeEventId, //
		data: AddToQueueData
	): Promise<KaraokeEvent & { queue: KaraokeUser[] }> {
		return this.repository.addUserToQueue({ eventId }, data);
	}

	public async removeUserFromQueue(
		{ eventId }: KaraokeEventId, //
		data: RemoveFromQueueData
	): Promise<KaraokeEvent & { queue: KaraokeUser[] }> {
		return this.repository.removeUserFromQueue({ eventId }, data);
	}

	public async setUserToSinger(memberManager: GuildMemberManager, eventUser: KaraokeUser): Promise<void> {
		const member = await memberManager.fetch(eventUser.id);
		if (member.voice.channelId && member.manageable) {
			if (member.voice.channel!.type === ChannelType.GuildStageVoice) {
				await member.voice.setSuppressed(false).catch();
			} else {
				await member.voice.setMute(false).catch();
			}
		}

		if (eventUser.partnerId && member.manageable) {
			const partner = await memberManager.fetch(eventUser.partnerId);

			if (partner.voice.channelId) {
				if (partner.voice.channel!.type === ChannelType.GuildStageVoice) {
					await partner.voice.setSuppressed(false).catch();
				} else {
					await partner.voice.setMute(false).catch();
				}
			}
		}
	}

	public async setUserToAudience(memberManager: GuildMemberManager, eventUser: KaraokeUser): Promise<void> {
		const member = await memberManager.fetch(eventUser.id);
		if (member.voice.channel && member.manageable) {
			if (member.voice.channel.type === ChannelType.GuildStageVoice) {
				await member.voice.setSuppressed(true).catch((error) => {
					container.logger.sentryError(error, { context: member });
				});
			} else {
				await member.voice.setMute(true).catch((error) => {
					container.logger.sentryError(error, { context: member });
				});
			}
		}

		if (eventUser.partnerId && member.manageable) {
			const partner = await memberManager.fetch(eventUser.partnerId);

			if (partner.voice.channel) {
				if (partner.voice.channel.type === ChannelType.GuildStageVoice) {
					await partner.voice.setSuppressed(true).catch((error) => {
						container.logger.sentryError(error, { context: partner });
					});
				} else {
					await partner.voice.setMute(true).catch((error) => {
						container.logger.sentryError(error, { context: partner });
					});
				}
			}
		}
	}

	public async rotateQueue(
		memberManager: GuildMemberManager,
		event: KaraokeEventWithUsers,
		textChannel: GuildTextBasedChannel | null
	): Promise<void> {
		const { queue } = event;

		const previousSinger = queue[0];
		const nextSinger = queue[1];

		const updatedEvent = await this.rotate(memberManager, event);

		const { result } = await container.validator.channels.canSendEmbeds(textChannel);
		if (isNullOrUndefined(textChannel) || !result) return;

		let done = userMention(previousSinger.id);
		let next = queue.length > 1 ? `${userMention(nextSinger.id)} is` : '';
		const mentions: string[] = queue.length > 1 ? [nextSinger.id] : [];

		if (previousSinger.partnerId) {
			done = `${userMention(previousSinger.id)} and ${userMention(previousSinger.partnerId)}`;
		}

		if (queue.length > 1 && nextSinger.partnerId) {
			next = `${userMention(nextSinger.id)} & ${userMention(nextSinger.partnerId)} are`;
			mentions.push(nextSinger.partnerId);
		}

		const content =
			queue.length > 1 //
				? `${done}'s turn is over.\n\n${next} up next!`
				: `${done}'s turn is over.`;

		await this.sendEmbed(textChannel, updatedEvent, content, mentions);
	}

	public async skipQueue(
		memberManager: GuildMemberManager,
		event: KaraokeEventWithUsers,
		textChannel: GuildTextBasedChannel | null,
		moderatorId: string
	): Promise<void> {
		const { queue } = event;

		const previousSinger = queue[0];
		const nextSinger = queue[1];

		const updatedEvent = await this.rotate(memberManager, event);

		const { result } = await container.validator.channels.canSendEmbeds(textChannel);
		if (isNullOrUndefined(textChannel) || !result) return;

		let done = `${userMention(previousSinger.id)} has been skipped by ${userMention(moderatorId)}`;
		let next = queue.length > 1 ? `${userMention(nextSinger.id)} is` : '';
		const mentions: string[] = queue.length > 1 ? [nextSinger.id] : [];

		if (previousSinger.partnerId) {
			done = `${userMention(previousSinger.id)} & ${userMention(previousSinger.partnerId)} have been skipped by ${userMention(moderatorId)}`;
		}

		if (queue.length > 1 && nextSinger.partnerId) {
			next = `${userMention(nextSinger.id)} & ${userMention(nextSinger.partnerId)} are`;
			mentions.push(nextSinger.partnerId);
		}

		const content =
			queue.length > 1 //
				? `${done}\n\n${next} up next!`
				: done;

		await this.sendEmbed(textChannel, updatedEvent, content, mentions);
	}

	public async forceRemoveUserFromQueue(
		memberManager: GuildMemberManager,
		event: KaraokeEventWithUsers,
		textChannel: GuildTextBasedChannel,
		moderatorId: string
	): Promise<void> {
		const { queue } = event;

		const previousSinger = queue[0];
		const nextSinger = queue[1];

		const updatedEvent = await this.rotate(memberManager, event);

		let done = `${userMention(previousSinger.id)} has been removed from the queue by ${userMention(moderatorId)}`;
		let next = queue.length > 1 ? `${userMention(nextSinger.id)} is` : '';
		const mentions: string[] = queue.length > 1 ? [nextSinger.id] : [];

		if (previousSinger.partnerId) {
			done = `${userMention(previousSinger.id)} & ${userMention(previousSinger.partnerId)} have been removed from the queue by ${userMention(
				moderatorId
			)}`;
		}

		if (queue.length > 1 && nextSinger.partnerId) {
			next = `${userMention(nextSinger.id)} & ${userMention(nextSinger.partnerId)} are`;
			mentions.push(nextSinger.partnerId);
		}

		const content =
			queue.length > 1 //
				? `${done}\n\n${next} up next!`
				: done;

		await this.sendEmbed(textChannel, updatedEvent, content, mentions);
	}

	public isJoinValid(
		event: KaraokeEventWithUsers,
		memberId: string,
		partner?: GuildMember
	): { valid: false; reason: string } | { valid: true; reason?: undefined } {
		if (event.locked) {
			return { valid: false, reason: 'The karaoke queue is locked.' };
		}
		if (event.queue.length > 50) {
			return { valid: false, reason: 'Queue limit of 50 people has been reached.' };
		}
		if (memberId === partner?.id) {
			return { valid: false, reason: 'You cannot duet with yourself.' };
		}
		if (partner && (!partner.voice.channelId || partner.voice.channelId !== event.id)) {
			return {
				valid: false,
				reason: `Tell your partner to please join the stage, then run this command again.\n\n**Stage:** <#${event.id}>`
			};
		}
		if (event.queue.some((member) => member.id === memberId)) {
			return { valid: false, reason: 'You are already in queue.' };
		}
		if (partner && event.queue.some((member) => member.id === partner.id)) {
			return { valid: false, reason: 'You or your partner are already in the queue.' };
		}
		return { valid: true };
	}

	public isAddValid(event: KaraokeEventWithUsers, memberId: string): { valid: false; reason: string } | { valid: true; reason?: undefined } {
		if (event.queue.length > 50) {
			return { valid: false, reason: 'Queue limit of 50 people has been reached.' };
		}
		if (event.queue.some((member) => member.id === memberId)) {
			return { valid: false, reason: 'User is already in the queue.' };
		}
		return { valid: true };
	}

	public async startEvent(
		guild: Guild,
		eventChannel: VoiceBasedChannel,
		textChannel: GuildTextBasedChannel,
		data: {
			stageTopic?: string | null;
			roleId?: string | null;
		}
	): Promise<Result<KaraokeEvent, Error>> {
		const { events, validator } = container;

		return Result.fromAsync(async () => {
			const eventName = data.stageTopic ?? 'Karaoke Event';
			const baseEmbed = events.karaokeInstructionsEmbed(eventChannel.id);
			const embed = await this.setupVoiceChannel(baseEmbed, eventChannel, eventName);

			const message = await this.sendAnnouncement(embed, textChannel, data.roleId);

			if (message && !textChannel.isVoiceBased()) {
				const canPin = await validator.client.hasChannelPermissions(textChannel, [PermissionFlagsBits.ManageMessages]);
				if (canPin) await message.pin();
			}

			return this.createEvent({
				id: eventChannel.id,
				guildId: guild.id,
				textChannelId: textChannel.id,
				pinMessageId: textChannel.isVoiceBased() ? undefined : message?.id
			});
		});
	}

	public async startScheduledEvent(guild: Guild, event: KaraokeEvent, stageTopic: string): Promise<Result<KaraokeEvent, Error>> {
		const { events, validator } = container;

		return Result.fromAsync(async () => {
			const [eventChannel, textChannel] = await this.fetchEventChannels(guild, event.id, event.textChannelId);

			const baseEmbed = events.karaokeInstructionsEmbed(event.id);
			const embed = await this.setupVoiceChannel(baseEmbed, eventChannel, stageTopic);

			const message = await this.sendAnnouncement(embed, textChannel, event.roleId);

			if (message && !textChannel.isVoiceBased()) {
				const canPin = await validator.client.hasChannelPermissions(textChannel, [PermissionFlagsBits.ManageMessages]);
				if (canPin) await message.pin();
			}

			return this.updateEvent({
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

	public async endEvent(guild: Guild, event: KaraokeEvent): Promise<Result<undefined, Error>> {
		const { validator } = container;

		return Result.fromAsync(async () => {
			const [eventChannel, textChannel] = await this.fetchEventChannels(guild, event.id, event.textChannelId);

			if (eventChannel.type === ChannelType.GuildStageVoice && eventChannel.stageInstance) {
				await eventChannel.stageInstance.delete();
			} else {
				const canMute = await validator.client.hasChannelPermissions(eventChannel, [PermissionFlagsBits.MuteMembers]);
				if (canMute) {
					await Promise.allSettled(
						eventChannel.members //
							.filter((member) => member.voice.serverMute)
							.map(async (member) => member.voice.setMute(false))
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

	private async rotate(memberManager: GuildMemberManager, event: KaraokeEventWithUsers): Promise<KaraokeEventWithUsers> {
		const { queue } = event;

		await this.removeUserFromQueue(
			{
				eventId: event.id
			},
			{ id: queue[0].id, partnerId: queue[0].partnerId }
		);

		await this.setUserToAudience(memberManager, queue[0]);

		if (queue.length > 1) {
			await this.setUserToSinger(memberManager, queue[1]);
		}

		queue.shift();
		return event;
	}

	private async sendEmbed(textChannel: GuildTextBasedChannel, event: KaraokeEventWithUsers, content: string, mentions: string[]): Promise<void> {
		await textChannel.send({
			content,
			allowedMentions: { users: mentions }
		});

		const embed = this.buildQueueEmbed(event);
		await textChannel.send({
			embeds: [embed]
		});
	}

	private async sendAnnouncement(embed: EmbedBuilder, textChannel: GuildTextBasedChannel, roleId?: string | null): Promise<Message | null> {
		return textChannel
			.send({
				content: `${roleId ? roleMention(roleId) : ''} A karaoke event has started!`,
				embeds: [embed],
				allowedMentions: { roles: roleId ? [roleId] : [] }
			})
			.catch(() => null);
	}

	private async setupVoiceChannel(embed: EmbedBuilder, eventChannel: VoiceBasedChannel, eventName: string): Promise<EmbedBuilder> {
		if (eventChannel.type === ChannelType.GuildStageVoice) {
			if (isNullOrUndefined(eventChannel.stageInstance)) {
				embed.setTitle(`Event: ${eventName}`);
				await eventChannel.createStageInstance({ topic: eventName });
			} else {
				embed.setTitle(`Event: ${eventChannel.stageInstance.topic}`);
			}
		} else {
			embed.setTitle('Event: Karaoke Event');

			if (eventChannel.members.size > 0) {
				await Promise.allSettled(
					eventChannel.members.map(async (member) => member.voice.setMute(true)) //
				);
			}
		}

		return embed;
	}

	private async fetchEventChannels(guild: Guild, eventId: string, textChannelId: string): Promise<[VoiceBasedChannel, GuildTextBasedChannel]> {
		const eventChannel = (await guild.channels.fetch(eventId)) as VoiceBasedChannel | null;
		if (!eventChannel) {
			throw new DiscordFetchError({
				message: 'Failed to fetch event voice channel',
				resourceId: eventId
			});
		}

		const textChannel = (await guild.channels.fetch(textChannelId)) as GuildTextBasedChannel | null;
		if (!textChannel) {
			throw new DiscordFetchError({
				message: 'Failed to fetch event text channel',
				resourceId: textChannelId
			});
		}

		return [eventChannel, textChannel];
	}
}
