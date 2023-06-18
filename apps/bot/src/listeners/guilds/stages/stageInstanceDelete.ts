import { isNullOrUndefined } from '#utils/functions';
import { Events, Listener } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import type { StageInstance } from 'discord.js';

@ApplyOptions<Listener.Options>({
	event: Events.StageInstanceDelete
})
export class StageListener extends Listener<typeof Events.StageInstanceDelete> {
	public async run(stageInstance: StageInstance): Promise<void> {
		const { events } = this.container;

		if (isNullOrUndefined(stageInstance.guild) || isNullOrUndefined(stageInstance.channel)) return;

		const settings = await events.settings.get(stageInstance.guildId);
		if (isNullOrUndefined(settings) || !settings.enabled) return;

		const event = await events.karaoke.getEvent(stageInstance.channelId);
		if (isNullOrUndefined(event) || !event.isActive) return;

		const result = await events.karaoke.endEvent(event);

		result.inspectErr((error) => {
			this.container.logger.sentryError(error, {
				context: {
					event,
					guildId: stageInstance.guild!.id
				}
			});
		});
	}
}
