import { writable, type Writable } from 'svelte/store';
import { getContext, setContext } from 'svelte';
import type { Channel, Guild, Role } from '$lib/types/app';

type GuildData = {
	guild: Guild;
	textChannels: Channel[];
	voiceChannels: Channel[];
	roles: Role[];
};

const storeCurrentGuild: Writable<GuildData | undefined> = writable(undefined);

export const createCurrentGuildContext = () => setContext('currentGuild', storeCurrentGuild);

export const getCurrentGuildContext = () =>
	getContext<Writable<GuildData | undefined>>('currentGuild');

export const setCurrentGuildContext = (currentGuild: GuildData | undefined) => {
	const context = getContext<Writable<GuildData | undefined>>('currentGuild');
	context.set(currentGuild);
};
