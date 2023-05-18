import type { FeatureFlags } from '@kbotdev/prisma';

export type UpsertCoreSettingsData = {
	flags?: FeatureFlags[];
};
