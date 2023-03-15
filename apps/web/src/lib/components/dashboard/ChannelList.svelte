<script lang="ts">
	/**
	 * Change this to Autocomplete when possible
	 * https://github.com/skeletonlabs/skeleton/pull/1045
	 */

	import Fa from 'svelte-fa';
	import { faHashtag, faVolumeHigh } from '@fortawesome/free-solid-svg-icons';
	import type { Channel } from '$lib/types/app';

	export let channels: Channel[];
	export let name: string;
	export let voice = false;

	let items: { label: string; value: string }[] = channels
		.sort((a, b) => a.position - b.position)
		.map(({ name, id }) => ({ label: name, value: id }));

	let selectedChannel: string;
</script>

<select class="select" {name} bind:value={selectedChannel} size="4">
	{#each items as { label, value }}
		<option class="flex items-baseline gap-2" {value}>
			{#if voice}
				<Fa icon={faVolumeHigh} size="lg" />
			{:else}
				<Fa icon={faHashtag} size="sm" />
			{/if}
			{label}
		</option>
	{/each}
</select>
