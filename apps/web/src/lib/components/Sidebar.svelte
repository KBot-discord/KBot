<script lang="ts">
	import ModuleRail from './dashboard/ModuleRail.svelte';
	import Navigation from './Navigation.svelte';
	import { page } from '$app/stores';
</script>

{#if $page.url.pathname.startsWith('/guilds')}
	<nav class="h-full">
		<ModuleRail />
	</nav>
{:else}
	<Navigation />
{/if}
