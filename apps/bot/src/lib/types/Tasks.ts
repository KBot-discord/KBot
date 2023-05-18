export type PollResultPayload = {
	guildId: string;
	pollId: string;
};

export type UnlockChannelPayload = {
	channelId: string;
};

export type UnmuteUserPayload = {
	guildId: string;
	userId: string;
};
