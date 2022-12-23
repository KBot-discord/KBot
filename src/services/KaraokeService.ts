import { container, Result } from '@sapphire/framework';
import {
	ButtonInteraction,
	type GuildMember,
	type GuildMemberManager,
	MessageEmbed,
	ModalSubmitInteraction,
	StageChannel,
	TextChannel,
	VoiceChannel
} from 'discord.js';
import { isNullish } from '@sapphire/utilities';
import { KaraokeRepository } from '../lib/database/repositories/KaraokeRepository';
import { EmbedColors } from '../lib/util/constants';
import type { Event, EventUser } from '@prisma/client';

export class KaraokeService {
	public readonly repo;

	public constructor() {
		this.repo = new KaraokeRepository();
		container.logger.info('Karaoke service loaded.');
	}

	public async startEvent(
		interaction: ModalSubmitInteraction | ButtonInteraction,
		voiceChannel: StageChannel | VoiceChannel,
		textChannel: TextChannel,
		stageTopic: string,
		pingRole: string
	): Promise<boolean | null> {
		const result = await Result.fromAsync(async () => {
			const guildId = interaction.guildId!;
			const eventExists = await this.repo.doesEventExist(guildId, voiceChannel.id);
			if (eventExists) {
				return interaction.followUp({
					embeds: [new MessageEmbed().setColor(EmbedColors.Default).setDescription('There is already a karaoke event')]
				});
			}

			// TODO check if bot has proper perms for voice and/or text channel

			const embed = new MessageEmbed();
			if (voiceChannel.type === 'GUILD_STAGE_VOICE') {
				if (isNullish(voiceChannel.stageInstance)) {
					embed.setTitle(`Event: ${stageTopic ? `${stageTopic}` : 'Karaoke Event'}`);
					await voiceChannel.createStageInstance({ topic: stageTopic ? `${stageTopic}` : 'Karaoke Event' });
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

			await interaction.followUp({
				embeds: [new MessageEmbed().setColor(EmbedColors.Success).setDescription('Event started.')],
				ephemeral: true
			});

			const announcement = await textChannel.send({
				content: `${pingRole || ''}A karaoke event has started!`,
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
			await this.repo.setEventStatus(guildId, voiceChannel.id, true);
			return this.repo.createEvent(voiceChannel.guildId, voiceChannel.id, textChannel.id, announcement.id);
		});
		return result.match({ ok: () => true, err: () => null });
	}

	public async skipUser(eventId: string, memberManager: GuildMemberManager, memberId: string): Promise<EventUser[] | null> {
		const result = await Result.fromAsync(async () => {
			const eventUser = await this.repo.fetchEventUser(eventId, memberId);
			if (isNullish(eventUser)) return eventUser;
			await this.setUserToAudience(memberManager, eventUser);
			return this.repo.removeFromQueue(eventId, eventUser.id, eventUser.partnerId ?? undefined);
		});
		return result.match({ ok: (data) => data, err: () => null });
	}

	/**
	 *
	 * @param memberManager
	 * @param eventUser
	 * @returns If the operation succeeded
	 */
	public async setUserToSinger(memberManager: GuildMemberManager, eventUser: EventUser): Promise<boolean | null> {
		const result = await Result.fromAsync(async () => {
			const member = await memberManager.fetch(eventUser.id);
			if (member.voice.channelId) {
				if (member.voice.channel!.isStageChannel()) await member.voice.setSuppressed(false).catch();
				else await member.voice.setMute(false).catch();
			}
			if (eventUser.partnerId) {
				const partner = await memberManager.fetch(eventUser.partnerId);
				if (partner.voice.channelId) {
					if (partner.voice.channel!.isStageChannel()) await partner.voice.setSuppressed(false).catch();
					else await partner.voice.setMute(false).catch();
				}
			}
		});
		return result.match({ ok: () => true, err: () => null });
	}

	/**
	 * Set the member/partner to the voice channel's speaker
	 * @param memberManager The GuildMemberManager of the client
	 * @param eventUser The EventUser entry of the member
	 * @returns If the operation succeeded
	 */
	public async setUserToAudience(memberManager: GuildMemberManager, eventUser: EventUser): Promise<boolean | null> {
		const result = await Result.fromAsync(async () => {
			const member = await memberManager.fetch(eventUser.id);
			if (member.voice.channelId) {
				if (member.voice.channel!.isStageChannel()) await member.voice.setSuppressed(true).catch();
				else await member.voice.setMute(true).catch();
			}
			if (eventUser.partnerId) {
				const partner = await memberManager.fetch(eventUser.partnerId);
				if (partner.voice.channelId) {
					if (partner.voice.channel!.isStageChannel()) await partner.voice.setSuppressed(true).catch();
					else await partner.voice.setMute(true).catch();
				}
			}
		});
		return result.match({ ok: () => true, err: () => null });
	}

	/**
	 * Check if the member is allowed to join the karaoke queue
	 * @param event The ID of the event
	 * @param queue An array of objects containing the user ID and name
	 * @param memberId The ID of the member
	 * @param partner The GuildMember object of the partner, if applicable
	 * @returns If the member/partner is allowed to join and, if applicable, the reason for denial
	 */
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

	/**
	 * Build a message embed based on the provided queue
	 * @param queue An array of objects containing the user ID and name
	 * @returns A formatted message embed
	 */
	public buildQueueEmbed(queue: EventUser[]): MessageEmbed {
		const embed = new MessageEmbed().setColor(EmbedColors.Default).setAuthor({ name: 'Karaoke queue' }).setTitle('Queue is empty');
		if (queue.length === 0) return embed.setTitle('Queue is empty');

		const description = queue.map((entry, index) => `**${index}.** ${entry.name}`);
		return embed.setTitle(`Current singer: ${queue[0].name}`).setDescription(description.join('\n'));
	}
}
