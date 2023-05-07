import { CacheValues, EmbedColors, KBotEmoji } from '#utils/constants';
import { karaokeEventActiveCacheKey, karaokeEventExistsCacheKey } from '#utils/cache';
import { isNullish } from '@sapphire/utilities';
import { ChannelType, EmbedBuilder, GuildScheduledEventStatus, PermissionFlagsBits } from 'discord.js';
import { container } from '@sapphire/framework';
import { roleMention, userMention } from '@discordjs/builders';
import type {
	AddToQueueData,
	RemoveFromQueueData,
	CreateEventData,
	CreateScheduledEventData,
	KaraokeEventId,
	GuildAndKaraokeEventId,
	GuildId,
	UpdateEventData,
	KaraokeEventWithUsers
} from '#types/database';
import type { PrismaClient, KaraokeEvent, KaraokeUser } from '@kbotdev/database';
import type { VoiceChannel, StageChannel, Guild, GuildTextBasedChannel, Message, TextChannel, GuildMember, GuildMemberManager } from 'discord.js';
import type { RedisClient } from '#extensions/RedisClient';

export class KaraokeService {
	private readonly database: PrismaClient;
	private readonly cache: RedisClient;

	private readonly existsKey = karaokeEventExistsCacheKey;
	private readonly isActiveKey = karaokeEventActiveCacheKey;

	public constructor() {
		this.database = container.prisma;
		this.cache = container.redis;
	}

	public async getEvent({ eventId }: KaraokeEventId) {
		return this.database.karaokeEvent.findUnique({
			where: { id: eventId }
		});
	}

	public async getEventWithQueue({ eventId }: KaraokeEventId) {
		return this.database.karaokeEvent.findUnique({
			where: { id: eventId },
			include: { queue: { orderBy: { createdAt: 'asc' } } }
		});
	}

	public async getEventByGuild({ guildId }: GuildId) {
		return this.database.karaokeEvent.findMany({
			where: { guildId }
		});
	}

	public async deleteEvent({ eventId }: KaraokeEventId) {
		return this.database.karaokeEvent
			.delete({
				where: { id: eventId }
			})
			.catch(() => null);
	}

	public async deleteScheduledEvent({ guildId, eventId }: GuildAndKaraokeEventId) {
		await this.setEventExists({ eventId, guildId }, false);
		return this.deleteEvent({ eventId });
	}

	public async updateQueueLock({ eventId }: KaraokeEventId, isLocked: boolean) {
		return this.database.karaokeEvent.update({
			where: { id: eventId },
			data: { locked: isLocked }
		});
	}

	public async createEvent({ id, guildId, textChannelId, pinMessageId }: CreateEventData) {
		await this.setEventExists({ eventId: id, guildId }, true);
		return this.database.karaokeEvent.create({
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

	public async createScheduledEvent({ id, guildId, textChannelId, discordEventId, roleId }: CreateScheduledEventData) {
		await this.setEventExists({ eventId: id, guildId }, true);
		return this.database.karaokeEvent.create({
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

	public async updateEvent({ id, textChannelId, locked, isActive, discordEventId, roleId }: UpdateEventData) {
		return this.database.karaokeEvent.update({
			where: { id },
			data: { textChannelId, locked, isActive, discordEventId, roleId }
		});
	}

	public async countEvents({ guildId }: GuildId) {
		return this.database.karaokeEvent.count({
			where: { guildId }
		});
	}

	public async eventExists({ guildId, eventId }: GuildAndKaraokeEventId): Promise<boolean> {
		const key = this.existsKey(guildId, eventId);

		const result = await this.cache.get(key);

		return result === CacheValues.Exists;
	}

	public async eventActive({ guildId, eventId }: GuildAndKaraokeEventId): Promise<boolean> {
		const key = this.isActiveKey(guildId, eventId);

		const result = await this.cache.get(key);

		return result === CacheValues.Active;
	}

	public async addUserToQueue({ eventId }: KaraokeEventId, { id, name, partnerId, partnerName }: AddToQueueData) {
		const data = await this.database.karaokeUser.create({
			data: { id, name, partnerId, partnerName, karaokeEvent: { connect: { id: eventId } } },
			include: {
				karaokeEvent: {
					include: { queue: { orderBy: { createdAt: 'asc' } } }
				}
			}
		});

		return data.karaokeEvent;
	}

	public async removeUserFromQueue({ eventId }: KaraokeEventId, { id }: RemoveFromQueueData) {
		const data = await this.database.karaokeUser.delete({
			where: { id_eventId: { id, eventId } },
			include: {
				karaokeEvent: {
					include: { queue: { orderBy: { createdAt: 'asc' } } }
				}
			}
		});

		return data.karaokeEvent;
	}

	public async setUserToSinger(memberManager: GuildMemberManager, eventUser: KaraokeUser): Promise<boolean | null> {
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

		return true;
	}

	public async setUserToAudience(memberManager: GuildMemberManager, eventUser: KaraokeUser): Promise<boolean | null> {
		const member = await memberManager.fetch(eventUser.id);
		if (member.voice.channel && member.manageable) {
			if (member.voice.channel.type === ChannelType.GuildStageVoice) {
				await member.voice.setSuppressed(true).catch((err) => {
					container.logger.error(err);
				});
			} else {
				await member.voice.setMute(true).catch((err) => {
					container.logger.error(err);
				});
			}
		}

		if (eventUser.partnerId && member.manageable) {
			const partner = await memberManager.fetch(eventUser.partnerId);

			if (partner.voice.channel) {
				if (partner.voice.channel.type === ChannelType.GuildStageVoice) {
					await partner.voice.setSuppressed(true).catch((err) => {
						container.logger.error(err);
					});
				} else {
					await partner.voice.setMute(true).catch((err) => {
						container.logger.error(err);
					});
				}
			}
		}

		return true;
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
		if (isNullish(textChannel) || !result) return;

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
		if (isNullish(textChannel) || !result) return;

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
	): { valid: true; reason?: undefined } | { valid: false; reason: string } {
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

	public isAddValid(event: KaraokeEventWithUsers, memberId: string): { valid: true; reason?: undefined } | { valid: false; reason: string } {
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
		try {
			const exists = await this.eventExists({ eventId: voiceChannel.id, guildId: guild.id });
			if (exists) {
				return null;
			}

			const eventName = stageTopic ? `${stageTopic}` : 'Karaoke Event';
			const embed = await this.buildStartEventEmbed(voiceChannel, eventName);

			const announcement = await this.postEventInstructions(voiceChannel, textChannel, embed, pingRole);

			await this.setEventExists({ eventId: voiceChannel.id, guildId: guild.id }, true);
			await this.setEventActive({ eventId: voiceChannel.id, guildId: guild.id }, true);
			return this.createEvent({
				id: voiceChannel.id,
				guildId: voiceChannel.guildId,
				textChannelId: textChannel.id,
				pinMessageId: announcement?.id
			});
		} catch (err: unknown) {
			container.logger.error(err);
			return null;
		}
	}

	public async endEvent(guild: Guild, event: KaraokeEvent) {
		const bot = await guild.members.fetchMe();
		const voiceChannel = (await guild.channels.fetch(event.id)) as StageChannel | VoiceChannel;

		await Promise.allSettled([
			this.setEventExists({ eventId: event.id, guildId: event.guildId }, false),
			this.setEventActive({ eventId: event.id, guildId: event.guildId }, false),
			this.deleteEvent({ eventId: event.id })
		]);

		if (voiceChannel.type === ChannelType.GuildStageVoice && voiceChannel.stageInstance) {
			await voiceChannel.stageInstance.delete();
		} else {
			const result = voiceChannel.permissionsFor(bot).has(PermissionFlagsBits.MuteMembers);
			if (result) {
				await Promise.all(
					voiceChannel.members //
						.filter((member) => member.voice.serverMute)
						.map((member) => member.voice.setMute(false))
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
		try {
			const exists = await this.eventExists({ eventId: event.id, guildId: guild.id });
			if (!exists) {
				return null;
			}

			const [voiceChannel, textChannel] = await Promise.all([
				guild.channels.fetch(event.id) as Promise<StageChannel | VoiceChannel>, //
				guild.channels.fetch(event.textChannelId) as Promise<GuildTextBasedChannel>
			]);

			const embed = await this.buildStartEventEmbed(voiceChannel, eventName);

			if (!isNullish(event.discordEventId)) {
				const discordEvent = await guild.scheduledEvents.fetch(event.discordEventId);
				if (!isNullish(discordEvent) && discordEvent.status === GuildScheduledEventStatus.Scheduled) {
					await discordEvent.setStatus(GuildScheduledEventStatus.Active);
				}
			}

			const announcement = await this.postEventInstructions(voiceChannel, textChannel, embed, event.roleId);

			await this.setEventActive({ eventId: voiceChannel.id, guildId: guild.id }, true);
			return this.updateEvent({
				id: voiceChannel.id,
				textChannelId: textChannel.id,
				isActive: true,
				locked: false,
				discordEventId: null,
				roleId: null,
				pinMessageId: announcement?.id
			});
		} catch (err: unknown) {
			container.logger.error(err);
			return null;
		}
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

	private async setEventExists({ guildId, eventId }: GuildAndKaraokeEventId, exists: boolean): Promise<boolean> {
		const key = this.existsKey(guildId, eventId);

		const value = exists ? CacheValues.Exists : CacheValues.DoesNotExist;

		return (await this.cache.set(key, value)) === 'OK';
	}

	private async setEventActive({ guildId, eventId }: GuildAndKaraokeEventId, active: boolean): Promise<boolean> {
		const key = this.isActiveKey(guildId, eventId);

		const value = active ? CacheValues.Active : CacheValues.Inactive;

		return (await this.cache.set(key, value)) === 'OK';
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
			if (isNullish(voiceChannel.stageInstance)) {
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
