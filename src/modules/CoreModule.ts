import { Module } from '@kbotdev/plugin-modules';
import { ApplyOptions } from '@sapphire/decorators';
import { KBotModules } from '../lib/types/Enums.js';

@ApplyOptions<Module.Options>({
	name: KBotModules.Core,
	fullName: 'Core Module',
})
export class CoreModule extends Module {
	public constructor(context: Module.LoaderContext, options: Module.Options) {
		super(context, options);

		this.container.core = this;
	}
}

declare module '@kbotdev/plugin-modules' {
	interface Modules {
		[KBotModules.Core]: never;
	}
}
