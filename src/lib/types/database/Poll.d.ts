import type { Poll, PollUser } from '#prisma';
import type { GuildId } from './';
import type { Expand } from '#types/Generic';

export interface PollId {
	pollId: Poll['id'];
}

export type GuildAndPollId = Expand<GuildId & PollId>;

export interface CreatePollData {
	title: Poll['title'];
	channelId: Poll['channelId'];
	time?: Poll['time'];
	options: Poll['options'];
}

export interface UpsertPollUserData {
	guildId: Poll['guildId'];
	pollId: Poll['id'];
	userId: PollUser['id'];
	option: number;
}
