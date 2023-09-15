<script lang="ts">
	export let id: string;
	export let title: string;
</script>

<label class="label flex flex-col" for={id}>
	<span class="font-semibold">{title}</span>
	<slot />
</label>
