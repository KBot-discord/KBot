import type { GuildFeature } from 'discord-api-types/payloads/v10';
import type { Permissions } from 'discord-api-types/globals';
import type { LoginData } from '@sapphire/plugin-api';
import type { DiscordGuild, DiscordUser } from '@kbotdev/proto';

export type IDiscordUser = Pick<DiscordUser, 'avatar' | 'id' | 'username'>;

export type IDiscordGuild = Pick<DiscordGuild, 'icon' | 'id' | 'name'>;

export type FormattedGuild = Omit<IDiscordGuild, 'icon'> & {
	features: GuildFeature[];
	permissions: Permissions;
} & {
	icon: string | null;
	owner: boolean;
};

export type TransformedLoginData = LoginData & {
	user: IDiscordUser | null | undefined;
	guilds: FormattedGuild[] | null | undefined;
};
