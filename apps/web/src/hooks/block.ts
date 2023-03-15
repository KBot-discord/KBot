import { isIP } from 'net';
import type { Handle } from '@sveltejs/kit';
import { NODE_ENV } from '$env/static/private';

export const handleBlock: Handle = async ({ event, resolve }) => {
	if (NODE_ENV !== 'production') return resolve(event);

	if (isIP(event.url.hostname) > 0) {
		return new Response(null, { status: 410 });
	}

	return resolve(event);
};
