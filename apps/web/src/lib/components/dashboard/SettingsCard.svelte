<script lang="ts">
	import Fa from 'svelte-fa';
	import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
	import { modalStore, type ModalSettings } from '@skeletonlabs/skeleton';
	import DocumentationModal from '$components/modals/DocumentationModal.svelte';

	export let id: string;
	export let title: string;
	export let footer = '';
	export let documentation = false;

	const modal: ModalSettings = {
		type: 'component',
		component: {
			ref: DocumentationModal
		}
	};

	function handleClick() {
		modalStore.trigger(modal);
	}
</script>

<div {id} class="card shadow-md w-full">
	<header class="card-header flex items-center gap-2 text-2xl mb-2">
		{title}
		{#if documentation}
			<span
				class="badge-icon variant-filled cursor-pointer"
				on:click={handleClick}
				on:keydown={handleClick}
			>
				<Fa icon={faQuestionCircle} size="lg" />
			</span>
		{/if}
	</header>
	<hr class="w-[96%] mx-auto" />
	<div class="p-4 space-y-4">
		<slot />
	</div>
	<footer class="card-footer">{footer}</footer>
</div>
