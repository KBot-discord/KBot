// Imports
import { Listener, Events, type ChatInputCommandFinishPayload } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { MetricsListener } from '../../lib/extensions/MetricsListener';
import type { CommandMetricLabels } from '../../lib/types/metrics';

@ApplyOptions<Listener.Options>({
	name: Events.ChatInputCommandFinish
})
export class CommandFinishListener extends MetricsListener {
	public run({ command, success }: ChatInputCommandFinishPayload) {
		const { commands } = this.container.metrics.counters;

		const labels: CommandMetricLabels = {
			name: command.name,
			category: command.fullCategory.join('/'),
			result: success ? 'success' : 'fail'
		};
		return commands.count.labels(labels).inc(1);
	}
}
