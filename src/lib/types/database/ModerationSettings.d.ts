import type { LockedChannel, Mute, ModerationSettings } from '#prisma';
import type { GuildId } from '#types/database';
import type { Expand } from '#types/Generic';

export interface LockedChannelId {
	discordChannelId: LockedChannel['id'];
}

export interface MuteById {
	userId: Mute['id'];
}

export type GuildAndMuteId = Expand<GuildId & MuteById>;

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
	id: LockedChannel['id'];
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
