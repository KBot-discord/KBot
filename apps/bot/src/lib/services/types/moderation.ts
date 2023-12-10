export type UpsertModerationSettingsData = {
	enabled?: boolean;
	reportChannelId?: string | null;
	minAccountAgeEnabled?: boolean;
	minAccountAgeReq?: number | null;
	minAccountAgeMsg?: string | null;
	antiHoistEnabled?: boolean;
};
