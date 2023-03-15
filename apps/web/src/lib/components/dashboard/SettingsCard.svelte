<script lang="ts">
	export let id: string;
	export let title: string;
	export let footer = '';
</script>

<div {id} class="card shadow-md w-full">
	<header class="card-header text-2xl mb-2">{title}</header>
	<hr class="w-[96%] mx-auto" />
	<div class="p-4">
		<slot />
	</div>
	<footer class="card-footer">{footer}</footer>
</div>
