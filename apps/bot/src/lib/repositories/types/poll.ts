import type { GuildId } from './generic';

export type PollId = {
	pollId: string;
};

export type GuildAndPollId = GuildId & PollId;

export type CreatePollData = {
	title: string;
	channelId: string;
	time?: bigint | null;
	options: string[];
	creator: string;
};

export type UpsertPollUserData = {
	guildId: string;
	pollId: string;
	userId: string;
	option: number;
};
