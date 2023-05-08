<script lang="ts">
	import type { PageData } from './$types';
	import Meta from '$components/Meta.svelte';

	export let data: PageData;
	const { settings } = data;
</script>

<Meta title="Utility" guildName={data.guild.name} />

<h2 id="main">Utility</h2>

<span>{JSON.stringify(settings)}</span>

<h2 id="emotes">Emotes</h2>
<h2 id="discord-status">Discord Status</h2>
<h2 id="poll">Poll</h2>
