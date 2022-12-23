import type { Key } from '../types/Cache';

const baseCacheKey = (guildId: string) => `kbot:core:guilds:${guildId}`;

export const karaokeEventExistsCacheKey = (guildId: string, eventId: string) => `${baseCacheKey(guildId)}:karaoke:${eventId}:exists` as Key;
export const karaokeEventActiveCacheKey = (guildId: string, eventId: string) => `${baseCacheKey(guildId)}:karaoke:${eventId}:active` as Key;

export const minageCacheKey = (guildId: string) => `${baseCacheKey(guildId)}:minage` as Key;

export const moderationCacheKey = (guildId: string) => `${baseCacheKey(guildId)}:moderation` as Key;
export const moderationEnabledCacheKey = (guildId: string) => `${baseCacheKey(guildId)}:moderation:enabled` as Key;

export const utilityCacheKey = (guildId: string) => `${baseCacheKey(guildId)}:utility` as Key;
export const utilityEnabledCacheKey = (guildId: string) => `${baseCacheKey(guildId)}:utility:enabled` as Key;

export const welcomeCacheKey = (guildId: string) => `${baseCacheKey(guildId)}:welcome` as Key;
export const welcomeEnabledCacheKey = (guildId: string) => `${baseCacheKey(guildId)}:welcome:enabled` as Key;
