import { CoreSettingsService } from '#services';
import { Module } from '@kbotdev/plugin-modules';

export class CoreModule extends Module {
	public readonly settings: CoreSettingsService;

	public constructor(options?: Module.Options) {
		super({ ...options, fullName: 'Core Module' });

		this.settings = new CoreSettingsService();
	}
}
