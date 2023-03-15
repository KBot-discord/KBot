<script lang="ts">
	import GuildListItem from './GuildListItem.svelte';
	import { flip } from 'svelte/animate';
	import { fade } from 'svelte/transition';
	import type { Guild } from '$lib/types/app';

	export let guilds: Guild[];
</script>

<div class="justify-center flex flex-wrap w-full">
	{#each guilds as guild (guild.id)}
		<span in:fade animate:flip={{ duration: 300 }}>
			<GuildListItem {guild} />
		</span>
	{/each}
	<div class="flex flex-col m-1 xs:m-3 text-center items-center">
		<div
			class="bg-primary-400-500-token rounded-[50%] ease-in-out duration-[225ms] hover:rounded-[35%] overflow-hidden"
		>
			<a href="/invite" target="_blank" rel="noreferrer">
				<svg class="h-32 w-32" viewBox="0 0 512 512">
					<text
						x="50%"
						y="53%"
						dominant-baseline="middle"
						text-anchor="middle"
						font-size={200}
						class="fill-token"
					>
						+
					</text>
				</svg>
			</a>
		</div>
		<span class="mt-2 text-center">Add a new server</span>
	</div>
</div>
