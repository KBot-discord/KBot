<script lang="ts">
	export let title: string;
</script>

<div class="flex flex-col gap-4 mt-6">
	<h2 class="text-2xl font-bold underline">
		{title}
	</h2>
	<div class="flex flex-col gap-4">
		<slot />
	</div>
</div>
