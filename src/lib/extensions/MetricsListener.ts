// Imports
import { Listener, container } from '@sapphire/framework';

export abstract class MetricsListener extends Listener {
	protected constructor(context: Listener.Context, { event, ...options }: Listener.Options) {
		super(context, { ...options, enabled: !container.config.isDev });
	}
}
