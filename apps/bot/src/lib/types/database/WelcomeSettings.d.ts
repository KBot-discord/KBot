import type { WelcomeSettings } from '#prisma';

export interface UpsertWelcomeSettingsData {
	enabled?: WelcomeSettings['enabled'];
	channelId?: WelcomeSettings['channelId'];
	message?: WelcomeSettings['message'];
	title?: WelcomeSettings['title'];
	description?: WelcomeSettings['description'];
	image?: WelcomeSettings['image'];
	color?: WelcomeSettings['color'];
}
