/**
 * Echo
 */
export const EchoCustomIds = {
	Detailed: 'echo-detailed' as const,
};

export const EchoFields = {
	Text: 'text-to-send',
} as const;

/**
 * Eval
 */
export const EvalCustomIds = {
	Eval: 'eval-code' as const,
};

export const EvalFields = {
	Code: 'code-to-eval',
} as const;

/**
 * Resources - Add emote/sticker
 */
export const ResourceCustomIds = {
	Emote: 'emote-resource-name' as const,
	Sticker: 'sticker-resource-name' as const,
};

export const ResourceFields = {
	Name: 'resourceName',
} as const;

/**
 * Credits
 */
export enum CreditType {
	Emote = 'e',
	Sticker = 's',
}

export const CreditCustomIds = {
	Create: 'credit-create' as const,
	ResourceRefresh: 'credit-resource-refresh' as const,
	ResourceEdit: 'credit-resource-edit' as const,
	ImageEdit: 'credit-image-edit' as const,
	ResourceModalCreate: 'credit-resource-mcreate' as const,
	ImageModalCreate: 'credit-image-mcreate' as const,
	ResourceModalEdit: 'credit-resource-medit' as const,
	ImageModalEdit: 'credit-image-medit' as const,
} as const;

export const CreditFields = {
	Name: 'creditName',
	Source: 'creditSource',
	Link: 'creditLink',
	Description: 'creditDesc',
	Artist: 'creditArtist',
} as const;

/**
 * Karaoke
 */
export const KaraokeCustomIds = {
	Create: 'karaoke-create' as const,
	Schedule: 'karaoke-schedule' as const,
	ModalCreate: 'karaoke-create-modal' as const,
	ModalSchedule: 'karaoke-schedule-modal' as const,
	Unschedule: 'karaoke-unschedule' as const,
	Add: 'karaoke-add' as const,
	Remove: 'karaoke-remove' as const,
	Lock: 'karaoke-lock' as const,
	Unlock: 'karaoke-unlock' as const,
	Skip: 'karaoke-skip' as const,
} as const;

/**
 * Polls
 */
export const PollCustomIds = {
	Vote: 'poll-vote' as const,
	ResultsPublic: 'poll-results-public' as const,
	ResultsHidden: 'poll-results-hidden' as const,
	End: 'poll-end' as const,
} as const;

/**
 * Report
 */
export const ReportCustomIds = {
	Timeout: '@kbotdev/report.timeout' as const,
	Delete: '@kbotdev/report.delete' as const,
	Info: '@kbotdev/report.info' as const,
} as const;

/**
 * YouTube
 */
export const YoutubeCustomIds = {
	RoleReaction: 'role-reaction' as const,
	RoleReactionMember: 'role-reaction-member' as const,
} as const;
