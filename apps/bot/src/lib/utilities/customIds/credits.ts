export const enum CreditType {
	Emote = 'e',
	Sticker = 's'
}

export const CreditCustomIds = {
	Create: 'credit-create',

	ResourceRefresh: 'credit-resource-refresh',

	ResourceEdit: 'credit-resource-edit',
	ImageEdit: 'credit-image-edit',

	ResourceModalCreate: 'credit-resource-mcreate',
	ImageModalCreate: 'credit-image-mcreate',

	ResourceModalEdit: 'credit-resource-medit',
	ImageModalEdit: 'credit-image-medit'
} as const;

export const CreditFields = {
	Name: 'creditName',
	Source: 'creditSource',
	Link: 'creditLink',
	Description: 'creditDesc',
	Artist: 'creditArtist'
} as const;
