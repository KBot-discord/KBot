export interface EmoteCredit {
	name: string;
	id: string;
}

export interface EmoteCreditModal {
	channelId: string;
	name: string;
	id: string;
}

export interface EmoteEditModal {
	id: string;
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
