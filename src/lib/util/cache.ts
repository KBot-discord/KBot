import type { Key } from '#types/Generic';

export const baseCacheKey = (guildId: string) => `kbot:core:guilds:${guildId}`;

export const eventCacheKey = (guildId: string) => `${baseCacheKey(guildId)}:event` as Key;

export const guildCacheKey = (guildId: string) => `${baseCacheKey(guildId)}:guild` as Key;

export const karaokeEventExistsCacheKey = (guildId: string, eventId: string) => `${baseCacheKey(guildId)}:karaoke:${eventId}:exists` as Key;
export const karaokeEventActiveCacheKey = (guildId: string, eventId: string) => `${baseCacheKey(guildId)}:karaoke:${eventId}:active` as Key;

export const moderationCacheKey = (guildId: string) => `${baseCacheKey(guildId)}:moderation` as Key;

export const notificationCacheKey = (guildId: string) => `${baseCacheKey(guildId)}:notification` as Key;

export const utilityCacheKey = (guildId: string) => `${baseCacheKey(guildId)}:utility` as Key;

export const welcomeCacheKey = (guildId: string) => `${baseCacheKey(guildId)}:welcome` as Key;
