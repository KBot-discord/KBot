import type { CoreSettings } from '#prisma';

export * from '#types/database/CoreSettings';
export * from '#types/database/EventSettings';
export * from '#types/database/Karaoke';
export * from '#types/database/ModerationSettings';
export * from '#types/database/Poll';
export * from '#types/database/UtilitySettings';
export * from '#types/database/WelcomeSettings';
export * from '#types/database/Youtube';

export interface GuildId {
	guildId: CoreSettings['guildId'];
}
