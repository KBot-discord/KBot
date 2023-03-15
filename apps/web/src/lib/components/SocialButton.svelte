<script lang="ts">
	export let href: string;
	export let internal = false;
</script>

{#if internal}
	<a {href} class="btn hover:variant-soft-primary p-0 h-12 w-12">
		<slot />
	</a>
{:else}
	<a {href} target="_blank" rel="noreferrer" class="btn hover:variant-soft-primary p-0 h-12 w-12">
		<slot />
	</a>
{/if}
