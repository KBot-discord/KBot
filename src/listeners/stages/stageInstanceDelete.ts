import { EmbedColors } from '#utils/constants';
import { Events, Listener } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { isNullish } from '@sapphire/utilities';
import { EmbedBuilder } from 'discord.js';
import type { StageInstance, GuildTextBasedChannel } from 'discord.js';

@ApplyOptions<Listener.Options>({
	name: Events.StageInstanceDelete
})
export class StageListener extends Listener {
	public async run(stageInstance: StageInstance): Promise<void> {
		const { logger, events } = this.container;

		if (isNullish(stageInstance.guild) || isNullish(stageInstance.channel)) return;

		const settings = await events.getSettings(stageInstance.guildId);
		if (isNullish(settings) || !settings.enabled) return;

		const active = await events.karaoke.isEventActive(stageInstance.guildId, stageInstance.channelId);
		if (!active) return;

		const event = await events.karaoke.fetchEvent(stageInstance.channelId);
		if (isNullish(event)) return;

		const textChannel = (await stageInstance.guild.channels.fetch(event.textChannelId)) as GuildTextBasedChannel | null;
		if (isNullish(textChannel)) return;

		try {
			await stageInstance.channel.createStageInstance(stageInstance);

			await textChannel.send({
				embeds: [
					new EmbedBuilder().setColor(EmbedColors.Default).setDescription('If you wish to end the event, please use `/manage karaoke menu`')
				]
			});
		} catch (err: unknown) {
			logger.error(err);
			await events.karaoke.endEvent(stageInstance.guild, event);
		}
	}
}
