import type { UtilitySettings } from '#prisma';

export interface UpsertUtilitySettingsData {
	enabled?: UtilitySettings['enabled'];
	incidentChannelId?: UtilitySettings['incidentChannelId'];
	creditsChannelId?: UtilitySettings['creditsChannelId'];
}