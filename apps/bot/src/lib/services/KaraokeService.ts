import { EmbedColors, KBotEmoji } from '#utils/constants';
import { isNullOrUndefined } from '#utils/functions';
import { ChannelType, EmbedBuilder, GuildScheduledEventStatus, PermissionFlagsBits } from 'discord.js';
import { container } from '@sapphire/framework';
import { roleMention, userMention } from '@discordjs/builders';
import { KaraokeRepository } from '@kbotdev/database';
import type {
	AddToQueueData,
	RemoveFromQueueData,
	CreateEventData,
	CreateScheduledEventData,
	KaraokeEventId,
	UpdateEventData,
	KaraokeEventWithUsers
} from '@kbotdev/database';
import type { KaraokeEvent, KaraokeUser } from '@kbotdev/prisma';
import type { VoiceChannel, StageChannel, Guild, GuildTextBasedChannel, Message, TextChannel, GuildMember, GuildMemberManager } from 'discord.js';

export class KaraokeService {
	private readonly repository: KaraokeRepository;

	public constructor() {
		this.repository = new KaraokeRepository({
			database: container.prisma,
			cache: {
				client: container.redis
			}
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

	public async deleteScheduledEvent(guildId: string, eventId: string): Promise<KaraokeEvent | null> {
		return this.repository.deleteScheduledEvent({ guildId, eventId });
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

	public async countEvents(guildId: string): Promise<number> {
		return this.repository.countEvents({ guildId });
	}

	public async eventExists(guildId: string, eventId: string): Promise<boolean> {
		return this.repository.eventExists({ guildId, eventId });
	}

	public async eventActive(guildId: string, eventId: string): Promise<boolean> {
		return this.repository.eventActive({ guildId, eventId });
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
		voiceChannel: StageChannel | VoiceChannel,
		textChannel: GuildTextBasedChannel,
		stageTopic?: string | null,
		pingRole?: string | null
	): Promise<KaraokeEvent | null> {
		const exists = await this.eventExists(guild.id, voiceChannel.id);
		if (exists) {
			container.logger.sentryMessage('Failed to start an event that does not exist', {
				context: { eventId: voiceChannel.id }
			});
			return null;
		}

		const eventName = stageTopic ? `${stageTopic}` : 'Karaoke Event';
		const embed = await this.buildStartEventEmbed(voiceChannel, eventName);

		const announcement = await this.postEventInstructions(voiceChannel, textChannel, embed, pingRole);

		await this.setEventExists(guild.id, voiceChannel.id, true);
		await this.setEventActive(guild.id, voiceChannel.id, true);
		return this.createEvent({
			id: voiceChannel.id,
			guildId: voiceChannel.guildId,
			textChannelId: textChannel.id,
			pinMessageId: announcement?.id
		});
	}

	public async endEvent(guild: Guild, event: KaraokeEvent): Promise<void> {
		const bot = await guild.members.fetchMe();
		const voiceChannel = (await guild.channels.fetch(event.id)) as StageChannel | VoiceChannel;

		await this.setEventExists(event.guildId, event.id, false);
		await this.setEventActive(event.guildId, event.id, false);
		await this.deleteEvent(event.id);

		if (voiceChannel.type === ChannelType.GuildStageVoice && voiceChannel.stageInstance) {
			await voiceChannel.stageInstance.delete();
		} else {
			const result = voiceChannel.permissionsFor(bot).has(PermissionFlagsBits.MuteMembers);
			if (result) {
				await Promise.all(
					voiceChannel.members //
						.filter((member) => member.voice.serverMute)
						.map(async (member) => member.voice.setMute(false))
				);
			}
		}

		if (event.pinMessageId) {
			const channel = (await voiceChannel.client.channels.fetch(event.textChannelId)) as TextChannel;
			const canUnpin: boolean = !channel.isVoiceBased() && channel.permissionsFor(bot).has(PermissionFlagsBits.ManageMessages);

			if (canUnpin) {
				const message = await channel.messages.fetch(event.pinMessageId);
				await message.unpin().catch(() => null);
			}
		}
	}

	public async startScheduledEvent(guild: Guild, event: KaraokeEvent, eventName: string): Promise<KaraokeEvent | null> {
		const exists = await this.eventExists(guild.id, event.id);
		if (!exists) {
			container.logger.sentryMessage('Failed to start a scheduled event that does not exist', {
				context: { eventId: event.id }
			});
			return null;
		}

		const [voiceChannel, textChannel] = await Promise.all([
			guild.channels.fetch(event.id) as Promise<StageChannel | VoiceChannel>, //
			guild.channels.fetch(event.textChannelId) as Promise<GuildTextBasedChannel>
		]);

		const embed = await this.buildStartEventEmbed(voiceChannel, eventName);

		if (!isNullOrUndefined(event.discordEventId)) {
			const discordEvent = await guild.scheduledEvents.fetch(event.discordEventId);
			if (!isNullOrUndefined(discordEvent) && discordEvent.status === GuildScheduledEventStatus.Scheduled) {
				await discordEvent.setStatus(GuildScheduledEventStatus.Active);
			}
		}

		const announcement = await this.postEventInstructions(voiceChannel, textChannel, embed, event.roleId);

		await this.setEventActive(guild.id, event.id, true);
		return this.updateEvent({
			id: voiceChannel.id,
			textChannelId: textChannel.id,
			isActive: true,
			locked: false,
			discordEventId: null,
			roleId: null,
			pinMessageId: announcement?.id
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

	private async setEventExists(guildId: string, eventId: string, exists: boolean): Promise<void> {
		return this.repository.setEventExists({ guildId, eventId }, exists);
	}

	private async setEventActive(guildId: string, eventId: string, active: boolean): Promise<void> {
		return this.repository.setEventActive({ guildId, eventId }, active);
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

	private async buildStartEventEmbed(voiceChannel: StageChannel | VoiceChannel, eventName: string): Promise<EmbedBuilder> {
		const embed = new EmbedBuilder();
		if (voiceChannel.type === ChannelType.GuildStageVoice) {
			if (isNullOrUndefined(voiceChannel.stageInstance)) {
				embed.setTitle(`Event: ${eventName}`);
				await voiceChannel.createStageInstance({ topic: eventName });
			} else {
				embed.setTitle(`Event: ${voiceChannel.stageInstance.topic}`);
			}
		} else {
			embed.setTitle('Event: Karaoke Event');

			if (voiceChannel.members.size > 0)
				await Promise.all(
					voiceChannel.members.map(async (member) => {
						await member.voice.setMute(true);
					})
				);
		}
		return embed;
	}

	private async postEventInstructions(
		voiceChannel: StageChannel | VoiceChannel,
		textChannel: GuildTextBasedChannel,
		embed: EmbedBuilder,
		roleId?: string | null
	): Promise<Message | undefined> {
		const { result } = await container.validator.channels.canSendEmbeds(textChannel);
		if (!result) return undefined;

		const announcement = await textChannel.send({
			content: `${roleId ? roleMention(roleId) : ''} A karaoke event has started!`,
			embeds: [
				embed.setColor(EmbedColors.Default).addFields(
					{ name: '**Voice channel:** ', value: `<#${voiceChannel.id}>` },
					{ name: '**Text channel:** ', value: `<#${textChannel.id}>`, inline: true },
					{
						name: '**Instructions:**',
						value: `**1.** Join the karaoke queue by running the \`\`/karaoke join\`\` slash command. The updated queue list will be shown in <#${textChannel.id}>
								**2.** Once your turn comes up, you will be invited to become a speaker on the stage.
								**3.** After singing, you can either leave the stage by muting your mic, clicking the "Move to audience" button, leaving the stage, or running the \`\`/karaoke leave\`\` slash command.`
					}
				)
			],
			allowedMentions: { roles: roleId ? [roleId] : [] }
		});

		const bot = await textChannel.guild.members.fetchMe();
		const canPin: boolean = !textChannel.isVoiceBased() && textChannel.permissionsFor(bot).has(PermissionFlagsBits.ManageMessages);

		return canPin ? announcement.pin() : undefined;
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
}
