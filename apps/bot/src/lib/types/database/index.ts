import type { CoreSettings } from '#prisma';

export * from './CoreSettings';
export * from './EventSettings';
export * from './Karaoke';
export * from './ModerationCase';
export * from './ModerationSettings';
export * from './Poll';
export * from './Twitch';
export * from './UtilitySettings';
export * from './WelcomeSettings';
export * from './Youtube';

export interface GuildId {
	guildId: CoreSettings['guildId'];
}
