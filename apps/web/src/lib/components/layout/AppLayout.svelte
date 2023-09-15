<script lang="ts">
	import { AppShell, Drawer } from '@skeletonlabs/skeleton';
	import { page } from '$app/stores';
	import Navbar from '$components/navigation/Navbar.svelte';
	import Footer from '$components/navigation/Footer.svelte';

	const sidebarEnabled = ['/guilds/'];

	$: classesSidebar = sidebarEnabled.some((path) => $page.url.pathname.startsWith(path))
		? 'w-0 lg:w-64'
		: 'w-0';
</script>

<Drawer width="w-80">
	<slot name="sidebar" />
</Drawer>

<AppShell slotSidebarLeft="bg-surface-500/5 {classesSidebar}">
	<svelte:fragment slot="header">
		<Navbar />
	</svelte:fragment>

	<svelte:fragment slot="sidebarLeft">
		<slot name="sidebar" />
	</svelte:fragment>

	<slot />

	<svelte:fragment slot="pageFooter">
		<Footer />
	</svelte:fragment>
</AppShell>
