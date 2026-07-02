/**
 * Add emote/Add sticker
 */
export type EmojiData = {
	url: string;
	animated: boolean;
	name?: string;
};

export type StickerData = {
	url: string;
	name?: string;
};

export type AddResourceModal = {
	/** Message ID */
	mi: string;

	/** User ID */
	ui: string;
};
