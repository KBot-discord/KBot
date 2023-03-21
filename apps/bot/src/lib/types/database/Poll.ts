import type { Poll } from '#prisma';
import type { GuildId } from './index';
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
	creator: Poll['creator'];
}

export interface UpsertPollUserData {
	guildId: Poll['guildId'];
	pollId: Poll['id'];
	userId: string;
	option: number;
}
