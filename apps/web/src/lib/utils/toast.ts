import { toastStore, type ToastSettings } from '@skeletonlabs/skeleton';

export function toast({
	message,
	background
}: {
	message: string;
	background: 'warning' | 'success' | 'error';
}): void {
	const settings: ToastSettings = {
		message,
		background,
		autohide: true,
		timeout: 5000
	};
	toastStore.trigger(settings);
}
