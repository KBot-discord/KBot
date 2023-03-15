<script lang="ts">
	import type { PageData } from './$types';
	import Meta from '$components/Meta.svelte';

	export let data: PageData;
</script>

<Meta title={data.guild.name} />

<h2 class="w-2/3">Guild name: {data.guild.name}</h2>
