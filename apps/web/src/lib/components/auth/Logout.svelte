<script lang="ts">
	import { goto } from '$app/navigation';

	function handleLogout() {
		return goto('/oauth/discord/logout');
	}
</script>

<button class="btn hover:variant-soft-primary w-full" on:click={handleLogout}>Logout</button>
