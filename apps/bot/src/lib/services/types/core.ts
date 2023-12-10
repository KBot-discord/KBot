import type { FeatureFlags } from '@prisma/client';

export type UpsertCoreSettingsData = {
	flags?: FeatureFlags[];
};
