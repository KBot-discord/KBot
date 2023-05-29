import { isNullOrUndefined } from '#utils/functions';
import { Events, Listener } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { ChannelType, PermissionFlagsBits } from 'discord.js';
import type { GuildTextBasedChannel, VoiceState } from 'discord.js';
import type { KaraokeUser } from '@kbotdev/database';

@ApplyOptions<Listener.Options>({
	event: Events.VoiceStateUpdate
})
export class VoiceListener extends Listener {
	public async run(oldState: VoiceState, newState: VoiceState): Promise<void> {
		const { events, validator } = this.container;
		const client = await newState.guild.members.fetchMe();

		const result = await validator.client.hasChannelPermissions(newState.channel, [
			PermissionFlagsBits.ManageEvents,
			PermissionFlagsBits.MuteMembers,
			PermissionFlagsBits.MoveMembers,
			PermissionFlagsBits.ManageChannels
		]);
		if (!result) return;

		// Filter the bot
		if (oldState.id === client.id) return;

		const eventId = oldState.channelId ?? newState.channelId;
		if (isNullOrUndefined(eventId)) return;

		// Filter mutes and deafens
		if (oldState.channel?.id === newState.channel?.id) return;

		const settings = await events.settings.get(newState.guild.id);
		if (isNullOrUndefined(settings) || !settings.enabled) return;

		// Get the event from the database
		const event = await events.karaoke.getEventWithQueue(eventId);
		if (isNullOrUndefined(event) || !event.isActive) return;

		// Mute new joins
		if (
			newState.channel?.type === ChannelType.GuildVoice && //
			!newState.serverMute &&
			newState.channelId === eventId &&
			isNullOrUndefined(oldState.channel)
		) {
			await newState.setMute(true);
			return;
		}

		const { queue } = event;

		// Filter if queue is empty or the user is not in the queue
		if (queue.length === 0 || !this.isUserInQueue(queue, oldState.id)) return;

		if (queue[0].partnerId) {
			const firstUser = await newState.guild.members.fetch(queue[0].id);
			const secondUser = await newState.guild.members.fetch(queue[0].partnerId);
			if (
				(firstUser.voice.suppress && secondUser.voice.suppress) || //
				(firstUser.voice.mute && secondUser.voice.mute)
			)
				return;
		}

		// User leaves channels
		if ((oldState.channelId && !newState.channelId) || newState.channelId !== event.id) {
			// Do nothing if nobody is in queue
			if (queue.length === 0) return;

			const textChannel = (await newState.guild.channels.fetch(event.textChannelId)) as GuildTextBasedChannel | null;
			if (isNullOrUndefined(textChannel)) return;

			// Rotate queue if the person to leave was speaking
			if (queue[0].id === newState.id || queue[0].partnerId === newState.id) {
				await events.karaoke.rotateQueue(oldState.guild.members, event, textChannel);
				return;
			}

			// Remove user from queue
			const user = queue.find(({ id, partnerId, eventId }) => eventId === oldState.channelId && (id === oldState.id || partnerId === oldState.id));
			if (isNullOrUndefined(user)) return;

			await events.karaoke.removeUserFromQueue({ eventId }, { id: user.id, partnerId: user.partnerId ?? undefined });

			const { result } = await validator.channels.canSendEmbeds(textChannel);
			if (result) {
				await textChannel.send({
					content: user.partnerId ? `<@${user.id}> & <@${user.partnerId}> have left the queue.` : `<@${user.id}> has left the queue.`,
					allowedMentions: { parse: ['users'] }
				});
			}

			return;
		}

		// User joins channel
		if (!newState.serverMute && newState.channelId === eventId && isNullOrUndefined(oldState.channel)) {
			await newState.setMute(true);
		}
	}

	private isUserInQueue(queue: KaraokeUser[], userId: string): boolean {
		return queue.some((user) => user.id === userId);
	}
}
