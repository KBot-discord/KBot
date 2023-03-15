import { getContext, setContext } from 'svelte';
import { localStorageStore } from '@skeletonlabs/skeleton';
import type { Writable } from 'svelte/store';
import type { User } from '$lib/types/app';

const storeUser: Writable<User | null> = localStorageStore('user', null);

export const createUserContext = () => setContext('user', storeUser);

export const getUserContext = () => getContext<Writable<User | null>>('user');

export const setUserContext = (user: User | undefined) => {
	const context = getContext<Writable<User | null>>('user');
	context.set(user ?? null);
};
