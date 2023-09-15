import { setUnsavedChangesContext } from '$stores/unsavedChanges';
import type { Action } from 'svelte/action';

export const detectChanges: Action<HTMLInputElement, { initialValue: unknown; value: unknown }> = (
	node
) => {
	return {
		update: ({ initialValue, value }) => {
			setUnsavedChangesContext({ [node.id]: initialValue !== value });
		}
	};
};
