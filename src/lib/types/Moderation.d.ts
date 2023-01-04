import { ModerationActionType } from '#lib/structures/ModerationAction';

interface BaseModerationContext {
	reason?: string;
	dm?: boolean;
	silent?: boolean;
}

export interface BanContext extends BaseModerationContext {
	daysToPurge?: number;
}

export interface KickContext extends BaseModerationContext {}

export interface MuteContext extends BaseModerationContext {
	time?: number;
}

export interface TimeoutContext extends BaseModerationContext {
	time?: number;
}

export interface ModerationLogContext {
	action: ModerationActionType;
	reason?: string;
	duration?: string;
}
