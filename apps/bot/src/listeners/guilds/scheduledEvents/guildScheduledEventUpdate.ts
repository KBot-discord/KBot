import { isNullOrUndefined } from '#utils/functions';
import { Listener } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { Events, GuildScheduledEventEntityType, GuildScheduledEventStatus, PermissionFlagsBits } from 'discord.js';
import type { Guild, GuildScheduledEvent, StageChannel, VoiceChannel } from 'discord.js';

@ApplyOptions<Listener.Options>({
	event: Events.GuildScheduledEventUpdate
})
export class GuildListener extends Listener {
	public async run(oldEvent: GuildScheduledEvent, newEvent: GuildScheduledEvent): Promise<void> {
		if (isNullOrUndefined(oldEvent.channel) || isNullOrUndefined(oldEvent.guild)) return;

		if (oldEvent.entityType !== GuildScheduledEventEntityType.External && newEvent.entityType === GuildScheduledEventEntityType.External) {
			return this.handleInternalToExternal(oldEvent.guild, oldEvent.channel);
		}

		if (oldEvent.status === GuildScheduledEventStatus.Scheduled && newEvent.status === GuildScheduledEventStatus.Active) {
			return this.handleGoingActive(oldEvent.guild, oldEvent.channel, oldEvent.name);
		}
	}

	/**
	 * Handle when a scheduled karaoke event's channel is set to no longer be in Discord.
	 * @param guild - The guild the event is in
	 * @param channel - The event's voice channel
	 */
	private async handleInternalToExternal(guild: Guild, channel: StageChannel | VoiceChannel): Promise<void> {
		const { events } = this.container;

		const settings = await events.settings.get(guild.id);
		if (isNullOrUndefined(settings) || !settings.enabled) return;

		const event = await events.karaoke.getEvent(channel.id);
		if (isNullOrUndefined(event) || event.isActive) return;

		await events.karaoke.deleteEvent(channel.id);
	}

	/**
	 * Handle when the Discord event associated with a scheduled karaoke event goes live.
	 * @param guild - The guild the event is in
	 * @param channel - the events voice channel
	 * @param stageTopic - The topic of the stage
	 */
	private async handleGoingActive(guild: Guild, channel: StageChannel | VoiceChannel, stageTopic: string): Promise<void> {
		const { events, validator } = this.container;

		const settings = await events.settings.get(guild.id);
		if (isNullOrUndefined(settings) || !settings.enabled) return;

		const event = await events.karaoke.getEvent(channel.id);
		if (isNullOrUndefined(event)) return;

		const validPermissions = await validator.client.hasChannelPermissions(channel, [
			PermissionFlagsBits.ManageEvents,
			PermissionFlagsBits.MuteMembers,
			PermissionFlagsBits.MoveMembers,
			PermissionFlagsBits.ManageChannels
		]);
		if (!validPermissions) {
			await events.karaoke.deleteEvent(channel.id);
			return;
		}
		if (event.isActive) return;

		const result = await events.karaoke.startScheduledEvent(guild, event, stageTopic);

		result.inspectErr((error) => {
			this.container.logger.sentryError(error, {
				context: {
					event,
					guildId: guild.id
				}
			});
		});
	}
}
