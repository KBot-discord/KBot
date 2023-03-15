<script lang="ts">
	import type { PageData } from './$types';
	import Meta from '$components/Meta.svelte';

	export let data: PageData;
</script>

<Meta title="Logs" guildName={data.guild.name} />

<h1>Logs</h1>
