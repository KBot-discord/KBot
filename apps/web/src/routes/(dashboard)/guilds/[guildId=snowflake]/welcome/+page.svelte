<script lang="ts">
	import type { PageData } from './$types';
	import Meta from '$components/Meta.svelte';

	export let data: PageData;
	const { settings } = data;
</script>

<Meta title="Welcome" guildName={data.guild.name} />

<h2 id="main">Welcome</h2>

<span>{JSON.stringify(settings)}</span>
