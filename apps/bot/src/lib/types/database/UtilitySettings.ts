import type { UtilitySettings } from '@kbotdev/database';

export interface UpsertUtilitySettingsData {
	enabled?: UtilitySettings['enabled'];
	incidentChannelId?: UtilitySettings['incidentChannelId'];
	creditsChannelId?: UtilitySettings['creditsChannelId'];
}
