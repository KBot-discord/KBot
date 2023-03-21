import type { CoreSettings } from '#prisma';

export interface UpsertCoreSettingsData {
	flags?: CoreSettings['flags'];
}
