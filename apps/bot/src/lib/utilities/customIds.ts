/**
 * Echo
 */
export const EchoCustomIds = {
	Detailed: 'echo-detailed' as const
};

export const EchoFields = {
	Text: 'text-to-send'
} as const;

/**
 * Eval
 */
export const EvalCustomIds = {
	Eval: 'eval-code' as const
};

export const EvalFields = {
	Code: 'code-to-eval'
} as const;

/**
 * Resources - Add emote/sticker
 */
export const ResourceCustomIds = {
	Name: 'resource-name' as const
};

export const ResourceFields = {
	Name: 'resourceName'
} as const;

/**
 * Credits
 */
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

/**
 * Karaoke
 */
export const KaraokeCustomIds = {
	Create: 'karaoke-create',
	Schedule: 'karaoke-schedule',
	ModalCreate: 'karaoke-create-modal',
	ModalSchedule: 'karaoke-schedule-modal',
	Unschedule: 'karaoke-unschedule',
	Add: 'karaoke-add',
	Remove: 'karaoke-remove',
	Lock: 'karaoke-lock',
	Unlock: 'karaoke-unlock',
	Skip: 'karaoke-skip'
} as const;

/**
 * Polls
 */
export const PollCustomIds = {
	Vote: 'poll-vote',
	ResultsPublic: 'poll-results-public',
	ResultsHidden: 'poll-results-hidden',
	End: 'poll-end'
} as const;

/**
 * Report
 */
export const ReportCustomIds = {
	Timeout: '@kbotdev/report.timeout',
	Delete: '@kbotdev/report.delete',
	Info: '@kbotdev/report.info'
} as const;

/**
 * YouTube
 */
export const YoutubeCustomIds = {
	RoleReaction: 'role-reaction',
	RoleReactionMember: 'role-reaction-member'
} as const;
