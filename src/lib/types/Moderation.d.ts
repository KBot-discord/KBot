import type { ModerationActionType } from '#lib/structures/ModerationAction';

interface BaseModerationContext {
	reason?: string | null;
	sendDm?: boolean | null;
	silent?: boolean | null;
}

export interface BanContext extends BaseModerationContext {
	daysToPurge?: number | null;
}

export interface UnbanContext extends BaseModerationContext {}

export interface KickContext extends BaseModerationContext {}

export interface MuteContext extends BaseModerationContext {
	duration?: number | null;
}

export interface UnmuteContext extends BaseModerationContext {}

export interface TimeoutContext extends BaseModerationContext {
	duration: number;
}

export interface UntimeoutContext extends BaseModerationContext {}

export interface ModerationActionContext {
	type: ModerationActionType;
	reason?: string | null;
	duration?: number | null;
}
