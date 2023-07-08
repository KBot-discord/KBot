<script lang="ts">
	import UserButton from './auth/UserButton.svelte';
	import { AppBar, LightSwitch, drawerStore } from '@skeletonlabs/skeleton';
	import logo from '$lib/images/logo.png';
	import BookIcon from '$lib/images/book.svelte';
	import DiscordIcon from '$lib/images/discord.svelte';
	import GithubIcon from '$lib/images/github.svelte';
	import HeartIcon from '$lib/images/heart.svelte';
	import PlusIcon from '$lib/images/plus.svelte';
	import NavbarButton from '$components/NavbarButton.svelte';
	import SocialButton from '$components/SocialButton.svelte';

	function drawerOpen(): void {
		drawerStore.open();
	}
</script>

<AppBar shadow="shadow-lg">
	<svelte:fragment slot="lead">
		<div class="flex items-center">
			<button class="lg:hidden btn btn-sm mr-2" on:click={drawerOpen}>
				<svg
					width="20"
					height="20"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					class="inline-block h-6 w-6 stroke-current"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 6h16M4 12h16M4 18h16"
					/>
				</svg>
			</button>
			<div class="flex flex-row gap-3 items-center">
				<a href="/" class="flex">
					<img height={48} width={48} src={logo} alt="logo" />
				</a>
				<strong class="hidden lg:block text-xl uppercase">KBot</strong>
			</div>
		</div>
	</svelte:fragment>
	<div class="flex flex-1 gap-2">
		<NavbarButton text="Docs" href="https://docs.kbot.ca">
			<BookIcon height={16} width={16} />
		</NavbarButton>
		<NavbarButton text="Add to Server" href="/invite">
			<PlusIcon height={16} width={16} />
		</NavbarButton>
		<NavbarButton text="Status" href="https://status.kbot.ca/">
			<HeartIcon height={18} width={18} />
		</NavbarButton>
		<NavbarButton text="Manage" href="/guilds" internal disablePrefetch>
			<HeartIcon height={18} width={18} />
		</NavbarButton>
	</div>
	<svelte:fragment slot="trail">
		<LightSwitch />
		<section class="flex space-x-1">
			<SocialButton href="/discord">
				<DiscordIcon height={24} width={24} />
			</SocialButton>
			<SocialButton href="/github">
				<GithubIcon height={20} width={20} />
			</SocialButton>
		</section>
		<UserButton />
	</svelte:fragment>
</AppBar>
