import type { DiscordUser, DiscordGuild, DiscordChannel, DiscordRole } from '@kbotdev/proto';

export type User = Pick<DiscordUser, 'id' | 'username' | 'discriminator' | 'avatar'>;

export type Guild = Pick<DiscordGuild, 'id' | 'name' | 'icon' | 'canManage'>;

export type Guilds = Map<string, Guild>;

export type Channel = Pick<DiscordChannel, 'id' | 'name' | 'position'>;

export type Role = Pick<DiscordRole, 'id' | 'name' | 'position' | 'color'>;
