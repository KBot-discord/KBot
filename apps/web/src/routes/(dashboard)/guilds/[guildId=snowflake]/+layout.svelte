<script lang="ts">
	import type { LayoutData } from './$types';
	import GuildShell from '$components/dashboard/GuildShell.svelte';
	import PageTransition from '$components/util/PageTransition.svelte';
	import { setCurrentGuildContext } from '$lib/stores/currentGuild';

	export let data: LayoutData;
	const { guild, textChannels, voiceChannels, roles } = data;

	setCurrentGuildContext({ guild, textChannels, voiceChannels, roles });
</script>

<PageTransition url={data.url}>
	<GuildShell>
		<slot />
	</GuildShell>
</PageTransition>
