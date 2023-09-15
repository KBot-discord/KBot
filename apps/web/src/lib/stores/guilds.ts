import { writable, type Writable } from 'svelte/store';
import { getContext, setContext } from 'svelte';
import type { Guild } from '$lib/types/app';

type GuildsStore = Writable<Map<string, Guild>>;

const GUILDS_KEY = 'Guilds';

export function createGuildsContext(guilds = new Map<string, Guild>()): GuildsStore {
	const store = writable(guilds);
	return setContext(GUILDS_KEY, store);
}

export function getGuildsContext(): GuildsStore {
	const store = getContext<GuildsStore | undefined>(GUILDS_KEY);

	if (!store) {
		throw Error('Please run `createGuildsContext` before trying to access the context.');
	}

	return store;
}

export function setGuildsContext(guilds = new Map<string, Guild>()): void {
	const context = getGuildsContext();
	context.set(guilds);
}
