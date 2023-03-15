<script lang="ts">
	import type { PageData } from './$types';
	import Meta from '$components/Meta.svelte';

	export let data: PageData;
	const { settings } = data;
</script>

<Meta title="Events" guildName={data.guild.name} />

<h2 class="w-2/3">Guild name: {data.guild.name}</h2>
<span>{JSON.stringify(settings)}</span>

<h2 id="main">Main</h2>

<h2 id="karaoke">Karaoke</h2>
