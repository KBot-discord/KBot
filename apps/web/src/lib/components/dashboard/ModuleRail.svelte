<script lang="ts">
	import GuildButton from './GuildButton.svelte';
	import { moduleSections } from './sections';
	import { AppRail, AppRailTile } from '@skeletonlabs/skeleton';
	import Fa from 'svelte-fa';
	import {
		faList,
		faHome,
		faGavel,
		faScrewdriverWrench,
		faDoorOpen,
		faPenToSquare,
		type IconDefinition
	} from '@fortawesome/free-solid-svg-icons';
	import { faYoutube } from '@fortawesome/free-brands-svg-icons';
	import { writable, type Writable } from 'svelte/store';
	import { page } from '$app/stores';
	import { getCurrentGuildContext } from '$lib/stores/currentGuild';

	let filteredModuleSections = moduleSections;
	let currentGuild = getCurrentGuildContext();

	const modules: { name: string; link: string; icon: IconDefinition }[] = [
		{ name: 'Home', link: '', icon: faHome },
		{ name: 'Moderation', link: '/moderation', icon: faGavel },
		{ name: 'Utility', link: '/utility', icon: faScrewdriverWrench },
		{ name: 'Welcome', link: '/welcome', icon: faDoorOpen },
		{ name: 'Youtube', link: '/youtube', icon: faYoutube },
		{ name: 'Logs', link: '/logs', icon: faPenToSquare }
	];

	function scrollIntoView({ target }: any) {
		const element = document.querySelector(target.getAttribute('href'));
		if (!element) return;
		element.scrollIntoView({
			behavior: 'smooth'
		});
	}

	function goTop() {
		const element = document.getElementById('page-content');
		if (!element) return;
		element.scrollIntoView({ behavior: 'smooth' });
	}

	const activeModule: Writable<string> = writable('list');

	$: disabled = $page.url.pathname === '/guilds';
	$: tag = disabled ? 'button' : 'a';
	$: module = modules.find(
		(m) => `/guilds/${$currentGuild?.guild.id}${m.link}` === $page.url.pathname
	);
	$: filteredModuleSections = moduleSections.filter((secton) => secton.title === module?.name);
	$: activeModule.set(module?.name ?? 'list');
</script>

<div
	class="grid grid-cols-[auto_1fr] h-full bg-surface-50-900-token border-r border-surface-500/30"
>
	<AppRail selected={activeModule} border="border-r border-surface-500/30">
		<svelte:fragment slot="lead">
			<AppRailTile
				label="Guilds"
				tag="a"
				href="/guilds"
				value={'list'}
				data-sveltekit-preload-data="tap"
			>
				<Fa icon={faList} />
			</AppRailTile>
			{#each modules as module}
				<AppRailTile
					label={module.name}
					href={`/guilds/${$currentGuild?.guild.id}${module.link}`}
					data-sveltekit-preload-data="hover"
					value={module.name}
					{disabled}
					{tag}
				>
					<Fa icon={module.icon} />
				</AppRailTile>
			{/each}
		</svelte:fragment>
	</AppRail>
	{#if $currentGuild}
		<section class="p-4 pb-20 space-y-4 overflow-y-auto">
			<div class="flex flex-col items-center space-y-3">
				<span>{$currentGuild.guild.name}</span>
				<GuildButton />
			</div>
			<hr />
			{#each filteredModuleSections as { values }}
				{#if values.length > 0}
					<nav class="list-nav">
						<ul>
							{#each values as { id, title }}
								{#if id === 'main'}
									<button class="w-full" on:click={goTop}>{title}</button>
								{:else}
									<a
										href={`#${id}`}
										class="w-full"
										on:click|preventDefault={scrollIntoView}
									>
										{title}
									</a>
								{/if}
							{/each}
						</ul>
					</nav>
				{/if}
			{/each}
		</section>
	{/if}
</div>
