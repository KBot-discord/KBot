import { writable, type Writable } from 'svelte/store';
import { getContext, setContext } from 'svelte';
import type { Channel, Guild, Role } from '$lib/types/app';

type GuildData = {
	guild: Guild;
	textChannels: Channel[];
	voiceChannels: Channel[];
	roles: Role[];
};

type CurrentGuildStore = Writable<GuildData | undefined>;

const CURRENT_GUILD_KEY = 'CurrentGuild';

export function createCurrentGuildContext(
	value: GuildData | undefined = undefined
): CurrentGuildStore {
	const store = writable(value);

	return setContext(CURRENT_GUILD_KEY, store);
}

export function getCurrentGuildContext(): CurrentGuildStore {
	const store = getContext<CurrentGuildStore | undefined>(CURRENT_GUILD_KEY);

	if (!store) {
		throw Error('Please run `createCurrentGuildContext` before trying to access the context.');
	}

	return store;
}

export function setCurrentGuildContext(guild: GuildData | undefined = undefined): void {
	const context = getCurrentGuildContext();
	context.set(guild);
}
