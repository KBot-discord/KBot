import type { Key } from '#types/Generic';

export const baseCacheKey = (guildId: string) => `kbot:bot:guilds:${guildId}`;

export const coreCacheKey = (guildId: string) => `${baseCacheKey(guildId)}:core` as Key;

export const eventCacheKey = (guildId: string) => `${baseCacheKey(guildId)}:event` as Key;
export const karaokeEventExistsCacheKey = (guildId: string, eventId: string) => `${baseCacheKey(guildId)}:karaoke:${eventId}:exists` as Key;
export const karaokeEventActiveCacheKey = (guildId: string, eventId: string) => `${baseCacheKey(guildId)}:karaoke:${eventId}:active` as Key;

export const moderationCacheKey = (guildId: string) => `${baseCacheKey(guildId)}:moderation` as Key;

export const premiumCacheKey = (guildId: string) => `${baseCacheKey(guildId)}:premium` as Key;

export const twitchCacheKey = (guildId: string) => `${baseCacheKey(guildId)}:twitch` as Key;

export const utilityCacheKey = (guildId: string) => `${baseCacheKey(guildId)}:utility` as Key;
export const pollCacheKey = (guildId: string) => `${baseCacheKey(guildId)}:utility:polls` as Key;

export const welcomeCacheKey = (guildId: string) => `${baseCacheKey(guildId)}:welcome` as Key;

export const youtubeCacheKey = (guildId: string) => `${baseCacheKey(guildId)}:youtube` as Key;

export const patreonTokenCacheKey = 'kbot:premium:patreon:token' as Key;
