import type { CoreSettings } from '#prisma';

export * from './EventSettingsRepository';
export * from './GuildSettingsRepository';
export * from './KaraokeRepository';
export * from './ModerationCaseRepository';
export * from './ModerationSettingsRepository';
export * from './NotificationSettingsRepository';
export * from './PollRepository';
export * from './UtilitySettingsRepository';
export * from './WelcomeSettingsRepository';

export interface QueryByGuildId {
	guildId: CoreSettings['guildId'];
}
