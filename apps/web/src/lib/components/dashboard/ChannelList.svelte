<script lang="ts">
	import type { Channel } from '$lib/types/app';

	export let channels: Channel[];
	export let name: string;

	let items: { label: string; value: string }[] = channels
		.sort((a, b) => a.position - b.position)
		.map(({ name, id }) => ({ label: name, value: id }));

	let selectedChannel: string;
</script>

<select class="select" {name} bind:value={selectedChannel}>
	{#each items as { label, value }}
		<option class="flex items-baseline gap-2" {value}>{label}</option>
	{/each}
</select>
