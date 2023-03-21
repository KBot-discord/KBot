export interface PollResultPayload {
	guildId: string;
	pollId: string;
}

export interface UnlockChannelPayload {
	channelId: string;
}

export interface UnmuteUserPayload {
	guildId: string;
	userId: string;
}
