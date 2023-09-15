<script lang="ts">
	import type { Channel } from '$lib/types/app';

	export let id: string;
	export let selected: string | undefined;
	export let channels: Channel[] = [];

	let items: { label: string; value: string }[] = channels
		.sort((a, b) => a.position - b.position)
		.map(({ name, id }) => ({ label: name, value: id }));
</script>

<select bind:value={selected} class="select" {id} name={id} on:change>
	<option class="flex items-baseline gap-2" value={undefined} selected>Select a channel…</option>
	{#each items as { label, value }}
		{#if selected && selected === value}
			<option class="flex items-baseline gap-2" {value} selected>{label}</option>
		{:else}
			<option class="flex items-baseline gap-2" {value}>{label}</option>
		{/if}
	{/each}
</select>
