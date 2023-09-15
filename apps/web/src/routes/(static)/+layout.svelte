<script lang="ts">
	import Navigation from '$components/navigation/Navigation.svelte';
	import AppLayout from '$components/layout/AppLayout.svelte';
</script>

<AppLayout>
	<svelte:fragment slot="sidebar">
		<Navigation />
	</svelte:fragment>

	<slot />
</AppLayout>
