import type { Key } from '../types/Cache';

const baseKey = (guildId: string) => `kbot:core:guilds:${guildId}`;

export const karaokeEventExistsKey = (guildId: string, eventId: string) => `${baseKey(guildId)}:karaoke:${eventId}:exists` as Key;
export const karaokeEventActiveKey = (guildId: string, eventId: string) => `${baseKey(guildId)}:karaoke:${eventId}:active` as Key;

export const minageKey = (guildId: string) => `${baseKey(guildId)}:minage` as Key;

export const welcomeKey = (guildId: string) => `${baseKey(guildId)}:welcome` as Key;
export const welcomeEnabledKey = (guildId: string) => `${baseKey(guildId)}:welcome:enabled` as Key;
