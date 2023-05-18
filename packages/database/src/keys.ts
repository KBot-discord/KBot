import type { Key } from '@kbotdev/redis';

export const baseCacheKey = (guildId: string): string => `kbot:bot:guilds:${guildId}`;

export const coreCacheKey = (guildId: string): Key => `${baseCacheKey(guildId)}:core` as Key;

export const eventCacheKey = (guildId: string): Key => `${baseCacheKey(guildId)}:event` as Key;
export const karaokeEventExistsCacheKey = (guildId: string, eventId: string): Key => `${baseCacheKey(guildId)}:karaoke:${eventId}:exists` as Key;
export const karaokeEventActiveCacheKey = (guildId: string, eventId: string): Key => `${baseCacheKey(guildId)}:karaoke:${eventId}:active` as Key;

export const moderationCacheKey = (guildId: string): Key => `${baseCacheKey(guildId)}:moderation` as Key;

export const utilityCacheKey = (guildId: string): Key => `${baseCacheKey(guildId)}:utility` as Key;
export const pollCacheKey = (guildId: string): Key => `${baseCacheKey(guildId)}:utility:polls` as Key;

export const welcomeCacheKey = (guildId: string): Key => `${baseCacheKey(guildId)}:welcome` as Key;

export const youtubeCacheKey = (guildId: string): Key => `${baseCacheKey(guildId)}:youtube` as Key;
