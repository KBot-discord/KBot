import type { CreditType } from '#utils/customIds';

/**
 * Credits
 */
export type Credit = {
	/** Emote/Sticker ID (ri = resource ID)*/
	ri: string;

	/** If it's an emote or sticker */
	t: CreditType;
};

export type CreditModal = {
	/** Channel ID */
	c: string;

	/** Emote/Sticker ID (ri = resource ID)*/
	ri: string;

	/** If it's an emote or sticker */
	t: CreditType;
};

export type CreditImageModal = {
	/** Channel ID */
	c: string;
};

export type CreditEditModal = {
	/** Emote/Sticker ID (ri = resource ID)*/
	ri: string;

	/** Message ID */
	mi: string;

	/** If it's an emote or sticker */
	t: CreditType;
};

export type CreditImageEditModal = {
	/** Message ID */
	mi: string;
};

/**
 * Events
 */
export type KaraokeMenuButton = {
	eventId: string;
};

/**
 * Polls
 */
export type PollOption = {
	option: string;
};

export type PollMenuButton = {
	pollId: string;
};
