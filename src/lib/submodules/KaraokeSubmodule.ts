import { KaraokeRepository } from '#repositories';
import { EmbedColors, Emoji } from '#utils/constants';
import { isNullish } from '@sapphire/utilities';
import { ChannelType, EmbedBuilder, GuildScheduledEventEntityType, GuildScheduledEventPrivacyLevel, GuildScheduledEventStatus } from 'discord.js';
import { container } from '@sapphire/framework';
import { roleMention, userMention } from '@discordjs/builders';
import type { VoiceChannel, StageChannel, GuildMember, GuildMemberManager, Guild, GuildTextBasedChannel, Message, TextChannel } from 'discord.js';
import type { Event, EventUser } from '#prisma';
import type { AddToQueueData, CreateScheduledEventData, EventWithUsers, RemoveFromQueueData, UpdateEventData } from '#types/repositories';

export class KaraokeSubmodule {
	private readonly repository: KaraokeRepository;

	public constructor() {
		this.repository = new KaraokeRepository();
	}

	public async fetchEvent(eventId: string) {
		return this.repository.findOne(
			{ eventId } //
		);
	}

	public async fetchEventWithQueue(eventId: string) {
		return this.repository.findOneWithQueue(
			{ eventId } //
		);
	}

	public async fetchEventsByGuildId(guildId: string) {
		return this.repository.findManyByGuildId(
			{ guildId } //
		);
	}

	public async deleteEvent(eventId: string) {
		return this.repository.deleteOne(
			{ eventId } //
		);
	}

	public async deleteScheduledEvent(eventId: string, guildId: string) {
		await this.repository.setEventExistence({ eventId, guildId }, false);
		return this.repository.deleteOne(
			{ eventId } //
		);
	}

	public async fetchQueue(eventId: string) {
		return this.repository.fetchQueue(
			{ eventId } //
		);
	}

	public async updateQueueLock(eventId: string, isLocked: boolean) {
		return this.repository.updateQueueLock(
			{ eventId }, //
			isLocked
		);
	}

	public async createScheduledEvent(data: CreateScheduledEventData) {
		await this.repository.setEventExistence({ eventId: data.id, guildId: data.guildId }, true);
		return this.repository.createOneScheduled(
			data //
		);
	}

	public async updateEvent(data: UpdateEventData) {
		return this.repository.updateOne(
			data //
		);
	}

	public async countEvents(guildId: string) {
		return this.repository.count(
			{ guildId } //
		);
	}

	public async isEventActive(guildId: string, eventId: string) {
		return this.repository.isEventActive(
			{ guildId, eventId } //
		);
	}

	public async setEventActive(guildId: string, eventId: string, isActive: boolean) {
		return this.repository.setEventActive(
			{ guildId, eventId }, //
			isActive
		);
	}

	public async doesEventExist(guildId: string, eventId: string) {
		return this.repository.doesEventExist(
			{ guildId, eventId } //
		);
	}

	public async addUserToQueue(eventId: string, data: AddToQueueData) {
		return this.repository.addUserToQueue(
			{ eventId }, //
			data
		);
	}

	public async removeUserFromQueue(eventId: string, { id, partnerId }: RemoveFromQueueData) {
		return this.repository.removeUserFromQueue(
			{ eventId }, //
			{ id, partnerId }
		);
	}

	public async startEvent(
		guild: Guild,
		voiceChannel: StageChannel | VoiceChannel,
		textChannel: GuildTextBasedChannel,
		stageTopic?: string | null,
		pingRole?: string | null
	): Promise<Event | null> {
		try {
			const exists = await this.repository.doesEventExist({ eventId: voiceChannel.id, guildId: guild.id });
			if (exists) {
				return null;
			}

			const eventName = stageTopic ? `${stageTopic}` : 'Karaoke Event';
			const embed = await this.buildStartEventEmbed(voiceChannel, eventName);

			await guild.scheduledEvents
				.create({
					entityType:
						voiceChannel.type === ChannelType.GuildStageVoice
							? GuildScheduledEventEntityType.StageInstance
							: GuildScheduledEventEntityType.Voice,
					channel: voiceChannel,
					privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
					scheduledStartTime: Date.now() + 1000000,
					name: eventName
				})
				.then((scheduleEvent) => scheduleEvent.setStatus(GuildScheduledEventStatus.Active));

			const announcement = await this.postEventInstructions(voiceChannel, textChannel, embed, pingRole);

			await this.repository.setEventExistence({ eventId: voiceChannel.id, guildId: guild.id }, true);
			await this.repository.setEventActive({ eventId: voiceChannel.id, guildId: guild.id }, true);
			return this.repository.createOne({
				id: voiceChannel.id,
				guildId: voiceChannel.guildId,
				textChannelId: textChannel.id,
				pinMessageId: announcement.id
			});
		} catch (err: unknown) {
			container.logger.error(err);
			return null;
		}
	}

	public async endEvent(guild: Guild, event: Event) {
		const voiceChannel = (await guild.channels.fetch(event.id)) as StageChannel | VoiceChannel;

		const discordEvents = await voiceChannel.guild.scheduledEvents.fetch();
		const discordEvent = discordEvents.find((event) => event.channelId === voiceChannel.id);
		if (!isNullish(discordEvent)) {
			await discordEvent.setStatus(GuildScheduledEventStatus.Completed);
		}

		if (voiceChannel.type === ChannelType.GuildStageVoice && voiceChannel.stageInstance) {
			await voiceChannel.stageInstance.delete();
		} else {
			await Promise.all(
				voiceChannel.members //
					.filter((member) => member.voice.serverMute)
					.map((member) => member.voice.setMute(false))
			);
		}

		if (event.pinMessageId) {
			const channel = (await voiceChannel.client.channels.fetch(event.textChannelId)) as TextChannel;
			const message = await channel.messages.fetch(event.pinMessageId);
			await message.unpin();
		}

		await this.repository.setEventExistence({ eventId: event.id, guildId: event.guildId }, false);
		await this.repository.setEventActive({ eventId: event.id, guildId: event.guildId }, false);
		await this.deleteEvent(event.id);
	}

	public async startScheduledEvent(guild: Guild, event: Event, eventName: string): Promise<Event | null> {
		try {
			const exists = await this.repository.doesEventExist({ eventId: event.id, guildId: guild.id });
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

			await this.repository.setEventActive({ eventId: voiceChannel.id, guildId: guild.id }, true);
			return this.repository.updateOne({
				id: voiceChannel.id,
				textChannelId: textChannel.id,
				isActive: true,
				locked: false,
				discordEventId: null,
				roleId: null,
				pinMessageId: announcement.id
			});
		} catch (err: unknown) {
			container.logger.error(err);
			return null;
		}
	}

	public async setUserToSinger(memberManager: GuildMemberManager, eventUser: EventUser): Promise<boolean | null> {
		const member = await memberManager.fetch(eventUser.id);
		if (member.voice.channelId) {
			if (member.voice.channel!.type === ChannelType.GuildStageVoice) {
				await member.voice.setSuppressed(false).catch();
			} else {
				await member.voice.setMute(false).catch();
			}
		}

		if (eventUser.partnerId) {
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

	public async setUserToAudience(memberManager: GuildMemberManager, eventUser: EventUser): Promise<boolean | null> {
		const member = await memberManager.fetch(eventUser.id);
		if (member.voice.channel) {
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

		if (eventUser.partnerId) {
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

	public async rotateQueue(memberManager: GuildMemberManager, event: EventWithUsers, textChannel: GuildTextBasedChannel | null): Promise<void> {
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
		event: EventWithUsers,
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
		event: EventWithUsers,
		textChannel: GuildTextBasedChannel | null,
		moderatorId: string
	): Promise<void> {
		const { queue } = event;

		const previousSinger = queue[0];
		const nextSinger = queue[1];

		const updatedEvent = await this.rotate(memberManager, event);

		const { result } = await container.validator.channels.canSendEmbeds(textChannel);
		if (isNullish(textChannel) || !result) return;

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
		event: EventWithUsers,
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

	public isAddValid(event: EventWithUsers, memberId: string): { valid: true; reason?: undefined } | { valid: false; reason: string } {
		if (event.queue.length > 50) {
			return { valid: false, reason: 'Queue limit of 50 people has been reached.' };
		}
		if (event.queue.some((member) => member.id === memberId)) {
			return { valid: false, reason: 'User is already in the queue.' };
		}
		return { valid: true };
	}

	public buildQueueEmbed(event: EventWithUsers): EmbedBuilder {
		const { queue } = event;

		const footerText = `Queue lock: ${event.locked ? Emoji.Locked : Emoji.Unlocked} | Size ${queue.length}/50`;

		const embed = new EmbedBuilder() //
			.setColor(EmbedColors.Default)
			.setAuthor({ name: `${Emoji.Microphone} Karaoke queue` })
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
	): Promise<Message> {
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
		return announcement.pin();
	}

	private async rotate(memberManager: GuildMemberManager, event: EventWithUsers): Promise<EventWithUsers> {
		const { queue } = event;

		await this.removeUserFromQueue(event.id, { id: queue[0].id, partnerId: queue[0].partnerId });

		await this.setUserToAudience(memberManager, queue[0]);

		if (queue.length > 1) {
			await this.setUserToSinger(memberManager, queue[1]);
		}

		queue.shift();
		return event;
	}

	private async sendEmbed(textChannel: GuildTextBasedChannel, event: EventWithUsers, content: string, mentions: string[]): Promise<void> {
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
