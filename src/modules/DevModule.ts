import { Module } from '@kbotdev/plugin-modules';
import { ApplyOptions } from '@sapphire/decorators';
import { KBotModules } from '../lib/types/Enums.js';

@ApplyOptions<Module.Options>({
	name: KBotModules.Dev,
	fullName: 'Dev Module',
})
export class DevModule extends Module {}

declare module '@kbotdev/plugin-modules' {
	interface Modules {
		[KBotModules.Dev]: never;
	}
}
