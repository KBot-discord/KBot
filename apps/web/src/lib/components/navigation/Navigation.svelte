<script lang="ts">
	import { getDrawerStore } from '@skeletonlabs/skeleton';
	import BookIcon from '$lib/images/book.svelte';
	import HeartIcon from '$lib/images/heart.svelte';
	import PlusIcon from '$lib/images/plus.svelte';

	const store = getDrawerStore();

	function drawerClose(): void {
		store.close();
	}
</script>

<nav class="list-nav p-4">
	<ul>
		<li>
			<a
				href="/guilds"
				class="btn justify-start"
				on:click={drawerClose}
				data-sveltekit-preload-data="tap"
			>
				<BookIcon height={16} width={16} />
				<span>Manage Guilds</span>
			</a>
		</li>
		<hr />
		<li>
			<a
				href="https://docs.kbot.ca"
				target="_blank"
				rel="noreferrer"
				class="btn justify-start"
			>
				<BookIcon height={16} width={16} />
				<span>Docs</span>
			</a>
		</li>
		<li>
			<a href="/invite" target="_blank" rel="noreferrer" class="btn justify-start">
				<PlusIcon height={16} width={16} />
				<span>Add to Server</span>
			</a>
		</li>
		<li>
			<a
				href="https://status.kbot.ca/"
				target="_blank"
				rel="noreferrer"
				class="btn justify-start"
			>
				<HeartIcon height={18} width={18} />
				<span>Status</span>
			</a>
		</li>
	</ul>
</nav>
