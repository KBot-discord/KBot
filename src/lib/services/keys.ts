export const baseCacheKey = (guildId: string): string => `kbot:bot:guilds:${guildId}`;

export const coreCacheKey = (guildId: string): string => `${baseCacheKey(guildId)}:core`;

export const eventCacheKey = (guildId: string): string => `${baseCacheKey(guildId)}:event`;

export const moderationCacheKey = (guildId: string): string => `${baseCacheKey(guildId)}:moderation`;

export const utilityCacheKey = (guildId: string): string => `${baseCacheKey(guildId)}:utility`;
export const pollCacheKey = (guildId: string): string => `${baseCacheKey(guildId)}:utility:polls`;

export const welcomeCacheKey = (guildId: string): string => `${baseCacheKey(guildId)}:welcome`;

export const youtubeCacheKey = (guildId: string): string => `${baseCacheKey(guildId)}:youtube`;
