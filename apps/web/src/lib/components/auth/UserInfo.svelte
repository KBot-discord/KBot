<script lang="ts">
	import { popup, type PopupSettings } from '@skeletonlabs/skeleton';
	import { createDefaultAvatar } from '$lib/utils/discord';
	import { getUserContext } from '$lib/stores/user';
	import { goto } from '$app/navigation';

	let settings: PopupSettings = {
		event: 'click',
		target: 'userInfoMenu',
		middleware: {
			offset: 20
		}
	};

	let storeUser = getUserContext();

	$: avatar = $storeUser?.avatar ?? createDefaultAvatar();

	function handleLogin() {
		return goto('/oauth/discord/login');
	}

	function handleLogout() {
		return goto('/oauth/discord/logout');
	}
</script>

{#if $storeUser}
	<button use:popup={settings}>
		<img src={avatar} alt="User avatar" class="w-12 h-12 rounded-full" />
	</button>

	<div class="card variant-filled-surface p-2 w-48" data-popup="userInfoMenu">
		<button class="btn hover:variant-soft-primary w-full" on:click={handleLogout}>Logout</button
		>
	</div>
{:else}
	<button class="btn variant-filled-primary w-full" on:click={handleLogin}>Login</button>
{/if}
