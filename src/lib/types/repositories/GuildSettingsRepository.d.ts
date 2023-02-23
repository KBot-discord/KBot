import type { CoreSettings } from '#prisma';

export interface UpsertCoreSettingsData {
	staffRoles?: CoreSettings['staffRoles'];
	botManagers?: CoreSettings['botManagers'];
}
