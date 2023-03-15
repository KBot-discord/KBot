<script lang="ts">
	import Meta from '$components/Meta.svelte';
</script>

<Meta title="Home" />

<div class="container h-full mx-auto flex justify-center items-center">
	<div class="space-y-10 text-center py-16">
		<h1>
			<span
				class="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent text-8xl font-bold box-decoration-clone"
			>
				KBot
			</span>
		</h1>
		<a
			href="/guilds"
			class="btn variant-filled-primary normal-case sm:text-lg"
			data-sveltekit-preload-data="tap"
		>
			Go to Dashboard
		</a>
	</div>
</div>
