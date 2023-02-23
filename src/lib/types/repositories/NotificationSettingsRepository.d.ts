import type { NotificationSettings } from '#prisma';

export interface UpsertNotificationSettingsData {
	enabled?: NotificationSettings['enabled'];
}
