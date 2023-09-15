import { writable, type Writable } from 'svelte/store';
import { getContext, setContext } from 'svelte';

export type UnsavedChangesStore = Writable<Record<string, boolean>>;

const UNSAVED_CHANGES_STORE = 'UnsavedChanges';

export function createUnsavedChangesContext(
	value: Record<string, boolean> = {}
): UnsavedChangesStore {
	const store = writable(value);

	return setContext(UNSAVED_CHANGES_STORE, store);
}

export function getUnsavedChangesContext(): UnsavedChangesStore {
	const store = getContext<UnsavedChangesStore | undefined>(UNSAVED_CHANGES_STORE);

	if (!store) {
		throw Error(
			'Please run `createUnsavedChangesContext` before trying to access the context.'
		);
	}

	return store;
}

export function setUnsavedChangesContext(value: Record<string, boolean> = {}): void {
	const context = getUnsavedChangesContext();

	if (value !== undefined) {
		context.update((prevVal) => ({ ...prevVal, ...value }));
	} else {
		context.set(value);
	}
}
