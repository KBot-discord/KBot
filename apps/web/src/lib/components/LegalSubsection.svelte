<script lang="ts">
	export let title: string;
</script>

<div class="flex flex-col gap-4">
	<h2 class="text-lg font-bold">
		{title}
	</h2>
	<div class="flex flex-col ml-8 gap-4">
		<slot />
	</div>
</div>
