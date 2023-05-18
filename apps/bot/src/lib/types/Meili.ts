export const MeiliCategories = {
	Commands: 'commands',
	YoutubeChannels: 'youtubeChannels',
	TwitchChannels: 'twitchChannels'
} as const;

export type MeiliIndex = (typeof MeiliCategories)[keyof typeof MeiliCategories];

export type MeiliDocument<T extends MeiliIndex> = T extends typeof MeiliCategories.Commands
	? DocumentCommand
	: T extends typeof MeiliCategories.YoutubeChannels
	? DocumentYoutubeChannel
	: T extends typeof MeiliCategories.TwitchChannels
	? DocumentTwitchChannel
	: never;

type DocumentBase = {
	id: string;
};

export type DocumentCommand = DocumentBase & {
	name: string;
	description: string;
};

export type DocumentYoutubeChannel = DocumentBase & {
	name: string;
	englishName: string | null;
	org: string | null;
	subOrg: string | null;
	group: string | null;
};

export type DocumentTwitchChannel = DocumentBase & {
	name: string;
	englishName: string | null;
	org: string | null;
	subOrg: string | null;
	group: string | null;
};
