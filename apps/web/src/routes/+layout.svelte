<script lang="ts">
	import '$lib/themes/default.postcss';
	import '@skeletonlabs/skeleton/styles/all.css';
	import '$lib/styles/globals.postcss';

	import { AppShell, Drawer, setInitialClassState, storePopup } from '@skeletonlabs/skeleton';
	import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';
	import { page } from '$app/stores';
	import Navbar from '$components/Navbar.svelte';
	import Sidebar from '$components/Sidebar.svelte';
	import Footer from '$components/Footer.svelte';
	import { createUserContext } from '$lib/stores/user';
	import { createCurrentGuildContext } from '$lib/stores/currentGuild';
	import { createGuildsContext } from '$lib/stores/guilds';
	import type { LayoutServerData } from './$types';
	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });

	const sidebarEnabled = ['/guilds'];

	export let data: LayoutServerData;

	let user = createUserContext();
	let guilds = createGuildsContext();
	let currentGuild = createCurrentGuildContext();

	user.set(data.user ?? null);
	guilds.set(new Map());
	currentGuild.set(undefined);

	$: classesSidebar = sidebarEnabled.some((path) => $page.url.pathname.startsWith(path))
		? 'w-0 lg:w-64'
		: 'w-0';
</script>

<svelte:head>
	{@html `<script>${setInitialClassState.toString()} setInitialClassState();</script>`}
</svelte:head>

<Drawer width="w-80">
	<Sidebar />
</Drawer>

<AppShell slotSidebarLeft="bg-surface-500/5 {classesSidebar}">
	<svelte:fragment slot="header">
		<Navbar />
	</svelte:fragment>
	<svelte:fragment slot="sidebarLeft">
		<Sidebar />
	</svelte:fragment>
	<slot />
	<svelte:fragment slot="pageFooter">
		<Footer />
	</svelte:fragment>
</AppShell>
