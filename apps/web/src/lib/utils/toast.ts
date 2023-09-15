import { getToastStore, type ToastSettings } from '@skeletonlabs/skeleton';

const settings: Partial<ToastSettings> = {
	autohide: true,
	timeout: 5000
};

export function getExtendedToastStore() {
	const store = getToastStore();

	return {
		trigger: store.trigger,
		success: function (message: string) {
			return this.trigger({
				...settings,
				message,
				background: 'variant-filled-success'
			});
		},
		warning: function (message: string) {
			return this.trigger({
				...settings,
				message,
				background: 'variant-filled-warning'
			});
		},
		error: function (message: string) {
			return this.trigger({
				...settings,
				message,
				background: 'variant-filled-error'
			});
		}
	};
}
