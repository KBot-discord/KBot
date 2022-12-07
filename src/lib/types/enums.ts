export const enum KaraokeCustomIds {
	Create = 'karaoke-create',
	Schedule = 'karaoke-schedule',
	ModalCreate = 'karaoke-create-modal',
	ModalSchedule = 'karaoke-schedule-modal',
	Start = 'karaoke-start',
	Stop = 'karaoke-stop',
	Add = 'karaoke-add',
	Remove = 'karaoke-remove',
	Lock = 'karaoke-lock',
	Unlock = 'karaoke-unlock',
	Skip = 'karaoke-skip'
}

export const enum AddEmoteCustomIds {
	Name = 'addemote-name',
	Credits = 'addemote-credits',
	ModalCredits = 'addemote-credits-modal',
	Edit = 'addemote-edit',
	ModalEdit = 'addemote-edit-modal'
}

export const enum AddEmoteFields {
	Name = 'emoteName',
	CreditLink = 'emoteCreditLink',
	CreditDescription = 'emoteCreditDesc',
	CreditArtistName = 'emoteCreditArtistName',
	CreditArtistLink = 'emoteCreditArtistLink'
}

export const enum PollCustomIds {
	Vote = 'poll-vote',
	ResultsPublic = 'poll-results-public',
	ResultsHidden = 'poll-results-hidden',
	End = 'poll-end'
}

// Services
export const enum ServiceType {
	Karaoke = 'karaoke',
	Poll = 'poll'
}

export const enum RedisQueries {
	IsActive,
	Exists
}

export const ArrowCustomId = 'arrow-menu';

export const enum MenuControl {
	First,
	Previous,
	Next,
	Last,
	Stop
}
