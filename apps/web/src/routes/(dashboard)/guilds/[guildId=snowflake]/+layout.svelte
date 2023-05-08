<script lang="ts">
	import type { LayoutData } from './$types';
	import GuildShell from '$components/dashboard/GuildShell.svelte';
	import { setCurrentGuildContext } from '$lib/stores/currentGuild';

	export let data: LayoutData;
	const { guild, textChannels, voiceChannels, roles } = data;

	setCurrentGuildContext({ guild, textChannels, voiceChannels, roles });
</script>

<GuildShell>
	<slot />
</GuildShell>
