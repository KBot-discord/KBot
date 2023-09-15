<script lang="ts">
	import Label from './Label.svelte';

	export let id: string;
	export let title: string;
</script>

<Label {id} {title}>
	<input {id} name={id} type="text" class="input" />
</Label>
