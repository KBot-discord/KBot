import type { ModerationSettings } from '#prisma';

export interface UpsertModerationSettingsData {
	enabled?: ModerationSettings['enabled'];
	reportChannelId?: ModerationSettings['reportChannelId'];
	minAccountAgeEnabled?: ModerationSettings['minAccountAgeEnabled'];
	minAccountAgeReq?: ModerationSettings['minAccountAgeReq'];
	minAccountAgeMsg?: ModerationSettings['minAccountAgeMsg'];
	antiHoistEnabled?: ModerationSettings['antiHoistEnabled'];
}
