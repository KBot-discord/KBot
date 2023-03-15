import type { CoreSettings } from '#prisma';

export interface UpsertCoreSettingsData {
	botManagerRoles?: CoreSettings['botManagerRoles'];
	flags?: CoreSettings['flags'];
}
