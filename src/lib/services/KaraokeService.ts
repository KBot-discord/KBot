import { KaraokeRepository } from '#lib/database/repositories/KaraokeRepository';
import { EmbedColors } from '#utils/constants';
import {
	ButtonInteraction,
	ChannelType,
	EmbedBuilder,
	type GuildMember,
	type GuildMemberManager,
	GuildScheduledEventEntityType,
	GuildScheduledEventPrivacyLevel,
	GuildScheduledEventStatus,
	ModalSubmitInteraction,
	StageChannel,
	TextChannel,
	VoiceChannel
} from 'discord.js';
import { isNullish } from '@sapphire/utilities';
import type { Event, EventUser } from '@prisma/client';

export class KaraokeService {
	public readonly repo;

	public constructor() {
		this.repo = new KaraokeRepository();
	}

	// TODO make a startScheduledEvent function since setEventExistence will overlap
	public async startEvent(
		interaction: ModalSubmitInteraction | ButtonInteraction,
		voiceChannel: StageChannel | VoiceChannel,
		textChannel: TextChannel,
		stageTopic: string,
		pingRole: string | null
	): Promise<Event | null> {
		const guildId = interaction.guildId!;
		const eventExists = await this.repo.doesEventExist(guildId, voiceChannel.id);
		if (eventExists) {
			return null;
		}

		// TODO check if bot has proper perms for voice and/or text channel

		const embed = new EmbedBuilder();
		const eventName = stageTopic ? `${stageTopic}` : 'Karaoke Event';

		if (voiceChannel.type === ChannelType.GuildStageVoice) {
			if (isNullish(voiceChannel.stageInstance)) {
				embed.setTitle(`Event: ${eventName}`);
				await voiceChannel.createStageInstance({ topic: eventName });
			} else embed.setTitle(`Event: ${voiceChannel.stageInstance.topic}`);
		} else {
			embed.setTitle('Event: Karaoke Event');
			if (voiceChannel.members.size > 0)
				await Promise.all(
					voiceChannel.members.map(async (member) => {
						await member.voice.setMute(true);
					})
				);
		}

		await interaction
			.guild!.scheduledEvents.create({
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

		const announcement = await textChannel.send({
			content: `${pingRole ?? ''}A karaoke event has started!`,
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
			allowedMentions: { parse: ['roles'] }
		});
		await announcement.pin();

		await this.repo.setEventExistence(guildId, voiceChannel.id, true);
		await this.repo.setEventActive(guildId, voiceChannel.id, true);
		return this.repo.createEvent(voiceChannel.guildId, voiceChannel.id, textChannel.id, announcement.id);
	}

	public async skipUser(eventId: string, memberManager: GuildMemberManager, memberId: string): Promise<EventUser[] | null> {
		const eventUser = await this.repo.fetchEventUser(eventId, memberId);
		if (isNullish(eventUser)) return eventUser;
		await this.setUserToAudience(memberManager, eventUser);
		return this.repo.removeFromQueue(eventId, eventUser.id, eventUser.partnerId ?? undefined);
	}

	public async setUserToSinger(memberManager: GuildMemberManager, eventUser: EventUser): Promise<boolean | null> {
		const member = await memberManager.fetch(eventUser.id);
		if (member.voice.channelId) {
			if (member.voice.channel!.type === ChannelType.GuildStageVoice) await member.voice.setSuppressed(false).catch();
			else await member.voice.setMute(false).catch();
		}
		if (eventUser.partnerId) {
			const partner = await memberManager.fetch(eventUser.partnerId);
			if (partner.voice.channelId) {
				if (partner.voice.channel!.type === ChannelType.GuildStageVoice) await partner.voice.setSuppressed(false).catch();
				else await partner.voice.setMute(false).catch();
			}
		}
		return true;
	}

	public async setUserToAudience(memberManager: GuildMemberManager, eventUser: EventUser): Promise<boolean | null> {
		const member = await memberManager.fetch(eventUser.id);
		if (member.voice.channelId) {
			if (member.voice.channel!.type === ChannelType.GuildStageVoice) await member.voice.setSuppressed(true).catch();
			else await member.voice.setMute(true).catch();
		}
		if (eventUser.partnerId) {
			const partner = await memberManager.fetch(eventUser.partnerId);
			if (partner.voice.channelId) {
				if (partner.voice.channel!.type === ChannelType.GuildStageVoice) await partner.voice.setSuppressed(true).catch();
				else await partner.voice.setMute(true).catch();
			}
		}
		return true;
	}

	public isJoinValid(event: Event, queue: EventUser[], memberId: string, partner?: GuildMember): { valid: boolean; reason?: string } {
		if (event.locked) {
			return { valid: false, reason: 'The karaoke queue is locked.' };
		}
		if (queue.length > 50) {
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
		if (queue.some((member) => member.id === memberId)) {
			return { valid: false, reason: 'You are already in queue.' };
		}
		if (partner && queue.some((member) => member.id === partner.id)) {
			return { valid: false, reason: 'You or your partner are already in the queue.' };
		}
		return { valid: true };
	}

	public buildQueueEmbed(queue: EventUser[]): EmbedBuilder {
		const embed = new EmbedBuilder().setColor(EmbedColors.Default).setAuthor({ name: 'Karaoke queue' }).setTitle('Queue is empty');
		if (queue.length === 0) return embed.setTitle('Queue is empty');

		const description = queue.map((entry, index) => `**${index}.** ${entry.name}`);
		return embed.setTitle(`Current singer: ${queue[0].name}`).setDescription(description.join('\n'));
	}
}
