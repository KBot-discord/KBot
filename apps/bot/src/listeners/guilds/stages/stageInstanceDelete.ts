import { EmbedColors } from '#utils/constants';
import { isNullOrUndefined } from '#utils/functions';
import { Events, Listener } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { EmbedBuilder } from 'discord.js';
import type { StageInstance, GuildTextBasedChannel } from 'discord.js';

@ApplyOptions<Listener.Options>({
	event: Events.StageInstanceDelete
})
export class StageListener extends Listener {
	public async run(stageInstance: StageInstance): Promise<void> {
		const { logger, events } = this.container;

		if (isNullOrUndefined(stageInstance.guild) || isNullOrUndefined(stageInstance.channel)) return;

		const settings = await events.settings.get(stageInstance.guildId);
		if (isNullOrUndefined(settings) || !settings.enabled) return;

		const active = await events.karaoke.eventActive(stageInstance.guildId, stageInstance.channelId);
		if (!active) return;

		const event = await events.karaoke.getEvent(stageInstance.channelId);
		if (isNullOrUndefined(event)) return;

		const textChannel = (await stageInstance.guild.channels.fetch(event.textChannelId)) as GuildTextBasedChannel | null;
		if (isNullOrUndefined(textChannel)) return;

		try {
			await stageInstance.channel.createStageInstance(stageInstance);

			await textChannel.send({
				embeds: [new EmbedBuilder().setColor(EmbedColors.Default).setDescription('If you wish to end the event, please use `/manage karaoke stop`')]
			});
		} catch (error: unknown) {
			logger.sentryError(error);
			await events.karaoke.endEvent(stageInstance.guild, event);
		}
	}
}
