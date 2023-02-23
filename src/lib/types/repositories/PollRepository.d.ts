import type { Poll, PollUser } from '#prisma';
import type { QueryByGuildId } from './';
import type { Expand } from '#types/Generic';

export interface PollById {
	pollId: Poll['id'];
}

export type PollByIdAndGuildId = Expand<PollById & QueryByGuildId>;

export type PollWithUsers = Expand<Poll & { users: PollUser[] }>;

export interface CreatePollData {
	title: Poll['title'];
	channelId: Poll['channelId'];
	time?: Poll['time'];
	options: Poll['options'];
}

export interface UpdatePollUserData {
	userId: PollUser['id'];
	pollId: Poll['id'];
	option: number;
}
