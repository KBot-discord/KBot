import type { CoreSettings } from '@kbotdev/database';

export interface UpsertCoreSettingsData {
	flags?: CoreSettings['flags'];
}
