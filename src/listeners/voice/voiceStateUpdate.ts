import { Events, Listener } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { isNullish } from '@sapphire/utilities';
import { ChannelType } from 'discord.js';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import type { GuildTextBasedChannel, VoiceState } from 'discord.js';
import type { EventUser } from '#prisma';

@ApplyOptions<Listener.Options>({
	event: Events.VoiceStateUpdate
})
export class ReadyListener extends Listener {
	public async run(oldState: VoiceState, newState: VoiceState) {
		const { events, validator } = this.container;
		const client = await newState.guild.members.fetchMe();

		const result = await validator.client.hasPermissions(newState.guild, [
			PermissionFlagsBits.ManageEvents,
			PermissionFlagsBits.MuteMembers,
			PermissionFlagsBits.MoveMembers,
			PermissionFlagsBits.ManageChannels
		]);
		if (!result) return;

		// Filter the bot
		if (oldState.id === client.id) return;

		const eventId = oldState.channelId ?? newState.channelId;
		if (isNullish(eventId)) return;

		// Filter mutes and deafens
		if (oldState.channel?.id === newState.channel?.id) return;

		const settings = await events.getSettings(newState.guild.id);
		if (isNullish(settings) || !settings.enabled) return;

		// Check if the event exists
		const exists = await events.karaoke.doesEventExist(oldState.guild.id, eventId);
		if (!exists) return;

		// Check if the event is active
		const eventActive = await events.karaoke.isEventActive(oldState.guild.id, eventId);
		if (!eventActive) return;

		// Get the event from the database
		const event = await events.karaoke.fetchEventWithQueue(eventId);
		if (isNullish(event)) return;

		//
		if (!newState.serverMute && newState.channelId === eventId && isNullish(oldState.channel)) {
			await newState.setMute(true);
			return;
		}

		const { queue } = event;

		// Filter if the user is not in the queue
		if (!this.isUserInQueue(queue, oldState.id)) return;

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
			if (oldState.channel?.type === ChannelType.GuildStageVoice && isNullish(oldState.channel.stageInstance)) {
				this.container.logger.info('[VoiceStateUpdate] Stage instance check.');
			}

			// Do nothing if nobody is in queue
			if (queue.length === 0) return;

			const textChannel = (await newState.guild.channels.fetch(event.textChannelId)) as GuildTextBasedChannel | null;
			if (isNullish(textChannel)) return;

			// Rotate queue if the person to leave was speaking
			if (queue[0].id === newState.id || queue[0].partnerId === newState.id) {
				await events.karaoke.rotateQueue(oldState.guild.members, event, textChannel);
				return;
			}

			// Remove user from queue
			const user = queue.find(
				({ id, partnerId, eventId }) => eventId === oldState.channelId && (id === oldState.id || partnerId === oldState.id)
			);
			if (isNullish(user)) return;

			await events.karaoke.removeUserFromQueue(oldState.id, { id: user.id, partnerId: user.partnerId ?? undefined });

			await textChannel.send({
				content: user.partnerId ? `<@${user.id}> & <@${user.partnerId}> have left the queue.` : `<@${user.id}> has left the queue.`,
				allowedMentions: { parse: ['users'] }
			});

			return;
		}

		// User joins channel
		if (!newState.serverMute && newState.channelId === eventId && isNullish(oldState.channel)) {
			await newState.setMute(true);
		}
	}

	private isUserInQueue(queue: EventUser[], userId: string) {
		return queue.some((user) => user.id === userId);
	}
}
