/**
 * The indexes for Meilisearch.
 */
export const MeiliCategories = {
	Commands: 'commands',
	YoutubeChannels: 'youtubeChannels'
} as const;

export type MeiliIndex = (typeof MeiliCategories)[keyof typeof MeiliCategories];

/**
 * Type for getting an interface from a {@link MeiliCategories} value.
 */
export type MeiliDocument<T extends MeiliIndex> = T extends typeof MeiliCategories.Commands
	? DocumentCommand
	: T extends typeof MeiliCategories.YoutubeChannels
		? DocumentYoutubeChannel
		: never;

type DocumentBase = {
	id: string;
};

/**
 * A Discord command.
 */
export type DocumentCommand = DocumentBase & {
	name: string;
	description: string;
};

/**
 * A Holodex YouTube channel
 */
export type DocumentYoutubeChannel = DocumentBase & {
	name: string;
	englishName: string | null;
	org: string | null;
	subOrg: string | null;
	group: string | null;
};

/**
 * A Holodex Twitch channel.
 */
export type DocumentTwitchChannel = DocumentBase & {
	name: string;
	englishName: string | null;
	org: string | null;
	subOrg: string | null;
	group: string | null;
};
