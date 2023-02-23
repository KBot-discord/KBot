import type { LockedChannel, Mute, ModerationSettings } from '#prisma';
import type { QueryByGuildId } from './';
import type { Expand } from '#types/Generic';

export interface LockedChannelById {
	channelId: LockedChannel['id'];
}

export interface MuteById {
	userId: Mute['id'];
}

export type MuteByIdAndGuildId = Expand<MuteById & QueryByGuildId>;

export interface UpsertModerationSettingsData {
	enabled?: ModerationSettings['enabled'];
	logChannelId?: ModerationSettings['logChannelId'];
	reportChannelId?: ModerationSettings['reportChannelId'];
	muteRoleId?: ModerationSettings['muteRoleId'];
	minAccountAgeEnabled?: ModerationSettings['minAccountAgeEnabled'];
	minAccountAgeReq?: ModerationSettings['minAccountAgeReq'];
	minAccountAgeMsg?: ModerationSettings['minAccountAgeMsg'];
	antiHoistEnabled?: ModerationSettings['antiHoistEnabled'];
}

export interface CreateLockedChannelData {
	duration?: LockedChannel['duration'];
	roleId: LockedChannel['roleId'];
	guildId: LockedChannel['guildId'];
}

export interface CreateMuteData {
	duration?: Mute['duration'];
	evadeTime?: Mute['evadeTime'];
}

export interface UpdateMuteData {
	evadeTime: Mute['evadeTime'];
}
