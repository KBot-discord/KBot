import { Module } from '@kbotdev/plugin-modules';
import { ApplyOptions } from '@sapphire/decorators';
import { CoreSettingsService } from '../lib/services/CoreSettingsService.js';
import { KBotModules } from '../lib/types/Enums.js';

@ApplyOptions<Module.Options>({
	name: KBotModules.Core,
	fullName: 'Core Module',
})
export class CoreModule extends Module {
	public readonly settings: CoreSettingsService;

	public constructor(context: Module.LoaderContext, options: Module.Options) {
		super(context, options);

		this.settings = new CoreSettingsService();

		this.container.core = this;
	}
}

declare module '@kbotdev/plugin-modules' {
	interface Modules {
		[KBotModules.Core]: never;
	}
}
