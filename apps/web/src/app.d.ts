import type { User, Guilds, Guild } from '$lib/types/app';

declare global {
	namespace App {
		interface Error {}
		interface Locals {
			user: User | undefined;
			guilds: Guilds | undefined;
			guild: Guild | undefined;
		}
		interface PageData {}
		interface Platform {}
	}
}

export {};
