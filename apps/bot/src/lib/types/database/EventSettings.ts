import type { EventSettings } from '@kbotdev/database';

export interface UpsertEventSettingsData {
	enabled?: EventSettings['enabled'];
}
