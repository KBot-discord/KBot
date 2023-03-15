<script>
	import { fly } from 'svelte/transition';
	export let url = '';
	const pageTransitionDuration = 300;
</script>

<div class="transition-outer">
	{#key url}
		<div
			class="transition-inner"
			in:fly={{ x: -5, duration: pageTransitionDuration, delay: 100 }}
			out:fly={{ x: 5, duration: pageTransitionDuration }}
		>
			<slot />
		</div>
	{/key}
</div>

<style>
	.transition-outer {
		display: grid;
		grid-template: 1fr 1fr;
	}
	.transition-inner {
		grid-row: 1;
		grid-column: 1;
	}
</style>
