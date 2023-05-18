export type UpsertWelcomeSettingsData = {
	enabled?: boolean;
	channelId?: string | null;
	message?: string | null;
	title?: string | null;
	description?: string | null;
	image?: string | null;
	color?: string | null;
};
