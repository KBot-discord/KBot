<script lang="ts">
	import type { LayoutData } from './$types';
	import { setCurrentGuildContext } from '$lib/stores/currentGuild';
	import { createUnsavedChangesContext } from '$stores/unsavedChanges';

	export let data: LayoutData;
	const { guild, textChannels, voiceChannels, roles } = data;

	createUnsavedChangesContext();
	setCurrentGuildContext({ guild, textChannels, voiceChannels, roles });
</script>

<div class="mx-auto p-8 max-w-5xl">
	<slot />
</div>
