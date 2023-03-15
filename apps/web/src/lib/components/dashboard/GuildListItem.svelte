<script lang="ts">
	import type { Guild } from '$lib/types/app';
	import { getGuildInitials } from '$lib/utils/discord';

	export let guild: Guild;
</script>

<div class="flex flex-col m-1 xs:m-3 text-center items-center">
	<div
		class="bg-primary-400-500-token rounded-[50%] ease-in-out duration-[225ms] hover:rounded-[35%] overflow-hidden"
	>
		<a href={`/guilds/${guild.id}`} class="unstyled" data-sveltekit-preload-data="hover">
			{#if guild.icon}
				<img height={128} width={128} src={guild.icon} alt={`${guild.name} icon`} />
			{:else}
				<svg class="h-32 w-32" viewBox="0 0 512 512">
					<text
						x="50%"
						y="54%"
						dominant-baseline="middle"
						text-anchor="middle"
						font-size={200}
						class="fill-token"
					>
						{getGuildInitials(guild.name)}
					</text>
				</svg>
			{/if}
		</a>
	</div>
	<span class="mt-2 text-center">{guild.name}</span>
</div>
