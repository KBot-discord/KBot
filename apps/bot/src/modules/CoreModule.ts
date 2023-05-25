import { CoreSettingsService } from '#services';
import { Module } from '@kbotdev/plugin-modules';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<Module.Options>({
	fullName: 'Core Module'
})
export class CoreModule extends Module {
	public readonly settings: CoreSettingsService;

	public constructor(context: Module.Context, options: Module.Options) {
		super(context, options);

		this.settings = new CoreSettingsService();

		this.container.core = this;
	}
}

declare module '@kbotdev/plugin-modules' {
	// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
	interface Modules {
		CoreModule: never;
	}
}
