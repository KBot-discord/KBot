import type { GuildFeature } from 'discord-api-types/payloads/v10';
import type { Permissions } from 'discord-api-types/globals';
import type { LoginData } from '@sapphire/plugin-api';
import type { DiscordGuild, DiscordUser } from '@kbotdev/proto';

export type IDiscordUser = Pick<DiscordUser, 'id' | 'username' | 'discriminator' | 'avatar'>;

export type IDiscordGuild = Pick<DiscordGuild, 'id' | 'name' | 'icon'>;

export type FormattedGuild = Omit<IDiscordGuild, 'icon'> & { icon: string | null; owner: boolean } & {
	features: GuildFeature[];
	permissions: Permissions;
};

export interface TransformedLoginData extends LoginData {
	user: IDiscordUser | null | undefined;
	guilds: FormattedGuild[] | null | undefined;
}
