import { writable, type Writable } from 'svelte/store';
import { getContext, setContext } from 'svelte';
import type { Guild } from '$lib/types/app';

const storeGuilds: Writable<Map<string, Guild>> = writable(new Map<string, Guild>());

export const createGuildsContext = () => setContext('guilds', storeGuilds);

export const getGuildsContext = () => getContext<Writable<Map<string, Guild>>>('guilds');

export const setGuildsContext = (guilds: Map<string, Guild> | undefined) => {
	const context = getContext<Writable<Map<string, Guild>>>('guilds');
	context.set(guilds ?? new Map<string, Guild>());
};
