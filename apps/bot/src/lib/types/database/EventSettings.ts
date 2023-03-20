import type { EventSettings } from '#prisma';

export interface UpsertEventSettingsData {
	enabled?: EventSettings['enabled'];
}
