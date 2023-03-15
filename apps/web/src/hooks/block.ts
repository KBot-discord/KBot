import { isIP } from 'net';
import type { Handle } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export const handleBlock: Handle = async ({ event, resolve }) => {
	if (env.NODE_ENV !== 'production') return resolve(event);

	if (isIP(event.url.hostname) > 0) {
		return new Response(null, { status: 410 });
	}

	return resolve(event);
};
