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

interface DocumentBase {
	id: string;
}

export interface DocumentCommand extends DocumentBase {
	name: string;
	description: string;
}

export interface DocumentYoutubeChannel extends DocumentBase {
	name: string;
	englishName: string | null;
	org: string | null;
	subOrg: string | null;
	group: string | null;
}

export interface DocumentTwitchChannel extends DocumentBase {
	name: string;
	englishName: string | null;
	org: string | null;
	subOrg: string | null;
	group: string | null;
}
