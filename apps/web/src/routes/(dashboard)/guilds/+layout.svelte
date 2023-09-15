<script lang="ts">
	import type { LayoutData } from './$types';
	import { createGuildsContext } from '$lib/stores/guilds';
	import AppLayout from '$components/layout/AppLayout.svelte';
	import ModuleRail from '$components/dashboard/ModuleRail.svelte';
	import { createCurrentGuildContext } from '$stores';

	export let data: LayoutData;

	let guilds = createGuildsContext(data.guilds);
	createCurrentGuildContext();

	$: preloadGuildIcons = [...$guilds.values()]
		.filter(({ icon }) => icon !== '')
		.map((guild) => guild.icon);
</script>

<svelte:head>
	{#each preloadGuildIcons as image}
		<link rel="prefetch" as="image" href={image} />
	{/each}
</svelte:head>

<AppLayout>
	<svelte:fragment slot="sidebar">
		<ModuleRail />
	</svelte:fragment>

	<slot />
</AppLayout>
