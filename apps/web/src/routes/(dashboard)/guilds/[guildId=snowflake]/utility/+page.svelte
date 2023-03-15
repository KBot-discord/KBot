<script lang="ts">
	import type { PageData } from './$types';
	import Meta from '$components/Meta.svelte';

	export let data: PageData;
	const { settings } = data;
</script>

<Meta title="Utility" guildName={data.guild.name} />

<h2 class="w-2/3">Guild name: {data.guild.name}</h2>
<span>{JSON.stringify(settings)}</span>
<h2 id="main" class="h-[100vh]">Main</h2>
<h2 id="emotes" class="h-[100vh]">Emotes</h2>
<h2 id="discord-status" class="h-[100vh]">Discord Status</h2>
<h2 id="poll" class="h-[100vh]">Poll</h2>
