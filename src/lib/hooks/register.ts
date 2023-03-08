import { PreInitializationHook } from './preInitialization';
import { preInitialization, SapphireClient } from '@sapphire/framework';

SapphireClient.plugins.registerPreInitializationHook(PreInitializationHook[preInitialization], 'KBot-PreInitialization');
