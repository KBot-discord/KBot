<script lang="ts">
	export let title: string;
</script>

<label class="flex flex-col gap-1">
	<span class="font-semibold">{title}</span>
	<slot />
</label>
