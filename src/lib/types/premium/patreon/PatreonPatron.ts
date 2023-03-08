import type { Snowflake } from 'discord-api-types/v10';

export interface PatreonPatron {
	name: string;
	avatar: string;
	cents: number;
	discordId: Snowflake;
}
