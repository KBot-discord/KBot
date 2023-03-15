<script lang="ts">
	import Logout from './Logout.svelte';
	import Login from './Login.svelte';
	import { popup, type PopupSettings } from '@skeletonlabs/skeleton';
	import { createDefaultAvatar } from '$lib/utils/discord';
	import { getUserContext } from '$lib/stores/user';

	let settings: PopupSettings = {
		event: 'click',
		target: 'userInfoMenu',
		middleware: {
			offset: 20
		}
	};

	let storeUser = getUserContext();

	$: avatar = $storeUser?.avatar ?? createDefaultAvatar($storeUser);
</script>

{#if $storeUser}
	<button use:popup={settings}>
		<img src={avatar} alt="User avatar" class="w-12 h-12 rounded-full" />
	</button>

	<div class="card variant-filled-surface p-2 w-48" data-popup="userInfoMenu">
		<Logout />
	</div>
{:else}
	<Login />
{/if}
