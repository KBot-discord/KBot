<script lang="ts">
	import { Toast } from '@skeletonlabs/skeleton';
	import type { LayoutData } from './$types';
	import { createCurrentGuildContext } from '$lib/stores/currentGuild';
	import { createGuildsContext, getGuildsContext } from '$lib/stores/guilds';

	export let data: LayoutData;

	createGuildsContext();
	createCurrentGuildContext();

	let guilds = getGuildsContext();
	guilds.set(data.guilds ?? new Map());

	$: preloadGuildIcons = [...$guilds.values()]
		.filter(({ icon }) => icon !== '')
		.map((guild) => guild.icon);
</script>

<Toast />

<svelte:head>
	{#each preloadGuildIcons as image}
		<link rel="prefetch" as="image" href={image} />
	{/each}
</svelte:head>

<slot />
