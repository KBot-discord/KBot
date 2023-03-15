<script lang="ts">
	import { getCurrentGuildContext } from '$lib/stores/currentGuild';
	import { getGuildInitials } from '$lib/utils/discord';

	let currentGuild = getCurrentGuildContext();
</script>

{#if $currentGuild}
	<div>
		{#if $currentGuild.guild.icon}
			<img
				src={$currentGuild.guild.icon}
				alt={`${$currentGuild.guild.name} icon`}
				class="w-12 h-12 rounded-full"
			/>
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
					{getGuildInitials($currentGuild.guild.name)}
				</text>
			</svg>
		{/if}
	</div>
{/if}
