import type { CreditType } from '#utils/customIds';

export interface Credit {
	/** Emote/Sticker ID (ri = resource ID)*/
	ri: string;

	/** If it's an emote or sticker */
	t: CreditType;
}

export interface CreditModal {
	/** Channel ID */
	c: string;

	/** Emote/Sticker ID (ri = resource ID)*/
	ri: string;

	/** If it's an emote or sticker */
	t: CreditType;
}

export interface CreditImageModal {
	/** Channel ID */
	c: string;
}

export interface CreditEditModal {
	/** Emote/Sticker ID (ri = resource ID)*/
	ri: string;

	/** Message ID */
	mi: string;

	/** If it's an emote or sticker */
	t: CreditType;
}

export interface CreditImageEditModal {
	/** Message ID */
	mi: string;
}
