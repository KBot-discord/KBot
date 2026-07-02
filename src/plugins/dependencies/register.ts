import { container, Plugin, preGenericsInitialization, SapphireClient } from '@sapphire/framework';
import { KBotMetrics } from '../../lib/observability/KBotMetrics.js';

export class DependenciesPlugin extends Plugin {
	public static override [preGenericsInitialization](this: SapphireClient): void {
		try {
			container.metrics = new KBotMetrics();
		} catch (error) {
			container.logger.error(error);
			void container.client.destroy();
			process.exit(1);
		}
	}
}

SapphireClient.plugins.registerPreGenericsInitializationHook(
	DependenciesPlugin[preGenericsInitialization],
	'Dependencies-PreGenericsInitialization',
);
