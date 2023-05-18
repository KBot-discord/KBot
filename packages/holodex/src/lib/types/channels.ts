export type HolodexChannel = {
	id: string;
	name: string;
	english_name: string | null;
	description: string;
	photo: string | null;
	thumbnail: string;
	banner: string | null;
	org: string | null;
	suborg: string | null;
	type: 'subber' | 'vtuber';
	twitter: string | null;
	inactive: boolean;
	twitch: string | null;
	group: string | null;
};

export type HolodexChannelMin = {
	id: string;
	name: string;
	english_name: string;
	type: string;
	photo: string;
};
