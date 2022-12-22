export interface PollOption {
	option: number;
}

export interface PollMenuButton {
	pollId: string;
}

export const enum PollCustomIds {
	Vote = 'poll-vote',
	ResultsPublic = 'poll-results-public',
	ResultsHidden = 'poll-results-hidden',
	End = 'poll-end'
}
