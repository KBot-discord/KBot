<script lang="ts">
	export let parent: any;
</script>

<div class="card p-4 w-modal shadow-xl space-y-4">
	<header class="text-2xl font-bold">Need help?</header>
	<p>
		If there are any features that you aren't sure about, feel free to check out the
		<a href="https://docs.kbot.ca/" target="_blank" rel="noreferrer">documentation</a>.
	</p>
	<footer class="modal-footer {parent.regionFooter}">
		<button class="btn {parent.buttonNeutral}" on:click={parent.onClose}>Close</button>
	</footer>
</div>
