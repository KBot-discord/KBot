<script lang="ts">
	import { enhance } from '$app/forms';
	import SettingsCard from '$components/dashboard/SettingsCard.svelte';
	import { getExtendedToastStore } from '$lib/utils/toast';
	import type { SubmitFunction } from '@sveltejs/kit';

	const toast = getExtendedToastStore();

	export let title: string;
	export let action: string | undefined = undefined;
	export let unsavedChanges: boolean;

	const handleSubmit: SubmitFunction = (event) => {
		if (!unsavedChanges) {
			event.cancel();
		}

		return async function ({ update, result }) {
			await update({ reset: false });

			if (result.type === 'success') {
				toast.success('Saved changes');
			} else {
				toast.error('Something went wrong when saving your changes.');
			}
		};
	};
</script>

<form method="post" {action} use:enhance={handleSubmit} class="flex">
	<SettingsCard {title} documentation>
		<slot />
		<svelte:fragment slot="footer">
			<button class="btn variant-filled-success" disabled={!unsavedChanges}> Save </button>
		</svelte:fragment>
	</SettingsCard>
</form>
