export interface EmoteCredit {
	/** Message ID */
	ei: string;
}

export interface EmoteCreditModal {
	/** Channel ID */
	c: string;

	/** Message ID */
	ei: string;
}

export interface EmoteEditModal {
	/** Emote ID */
	ei: string;

	/** Message ID */
	mi: string;
}
