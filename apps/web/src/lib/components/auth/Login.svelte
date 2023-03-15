<script lang="ts">
	import { goto } from '$app/navigation';

	function handleLogin() {
		return goto('/oauth/discord/login');
	}
</script>

<button class="btn variant-filled-primary w-full" on:click={handleLogin}>Login</button>
