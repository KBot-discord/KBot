<script lang="ts">
	export let href: string;
	export let text = '';
	export let internal = false;
	export let disablePrefetch = false;

	let strategy: 'off' | 'hover' = disablePrefetch ? 'off' : 'hover';
</script>

{#if internal}
	<a
		{href}
		class="hidden lg:flex btn hover:variant-soft-primary"
		data-sveltekit-preload-data={strategy}
	>
		<slot />
		{#if text}
			<span class="hidden sm:flex">{text}</span>
		{/if}
	</a>
{:else}
	<a
		{href}
		target="_blank"
		rel="noreferrer"
		class="hidden lg:flex btn hover:variant-soft-primary"
		data-sveltekit-preload-data={strategy}
	>
		<slot />
		{#if text}
			<span class="hidden sm:flex">{text}</span>
		{/if}
	</a>
{/if}
