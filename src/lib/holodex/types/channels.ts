/**
 * A Holodex channel.
 */
export type HolodexChannel = {
	/**
	 * The channel's ID.
	 */
	id: string;

	/**
	 * The channel's name.
	 */
	name: string;

	/**
	 * The channel's english name.
	 */
	english_name: string | null;

	/**
	 * The channel's description.
	 */
	description: string;

	/**
	 * The channel's photo.
	 */
	photo: string | null;

	/**
	 * The channel's thumbnail.
	 */
	thumbnail: string;

	/**
	 * The channel's banner.
	 */
	banner: string | null;
	org: string | null;
	suborg: string | null;

	/**
	 * If the channel is a subber or a VTuber.
	 */
	type: 'subber' | 'vtuber';

	/**
	 * The channel's Twitter handle.
	 */
	twitter: string | null;

	/**
	 * If the channel is active.
	 */
	inactive: boolean;

	/**
	 * The channel's Twitch handle.
	 */
	twitch: string | null;

	/**
	 * The group that the channel is apart of.
	 */
	group: string | null;
};

/**
 * A Holodex channel with minimal informating.
 */
export type HolodexChannelMin = {
	/**
	 * The channel's ID.
	 */
	id: string;

	/**
	 * The channel's name.
	 */
	name: string;

	/**
	 * The channel's english name.
	 */
	english_name: string;

	/**
	 * If the channel is a subber or a VTuber.
	 */
	type: string;

	/**
	 * The channel's photo.
	 */
	photo: string;
};
