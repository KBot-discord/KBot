<script lang="ts">
	import '../app.postcss';

	import { Modal, Toast, storePopup, initializeStores } from '@skeletonlabs/skeleton';
	import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';
	import { createUserContext } from '$lib/stores/user';
	import type { LayoutServerData } from './$types';

	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });

	export let data: LayoutServerData;

	initializeStores();
	createUserContext(data.user);
</script>

<Modal />

<Toast position="br" />

<slot />
