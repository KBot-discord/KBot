import { PreGenericsInitializationHook } from '#hooks/preGenericsInitialization';
import { preGenericsInitialization, SapphireClient } from '@sapphire/framework';

SapphireClient.plugins.registerPreGenericsInitializationHook(
	PreGenericsInitializationHook[preGenericsInitialization],
	'KBot-PreGenericsInitialization'
);
