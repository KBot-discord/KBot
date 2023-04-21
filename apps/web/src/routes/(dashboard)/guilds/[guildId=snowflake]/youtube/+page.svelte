<script lang="ts">
	import type { PageData } from './$types';
	import Meta from '$components/Meta.svelte';

	export let data: PageData;
	const { settings } = data;
</script>

<Meta title="Youtube" guildName={data.guild.name} />

<h2 id="main">YouTube</h2>

<span>{JSON.stringify(settings)}</span>
