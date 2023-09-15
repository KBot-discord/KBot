import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { sendToOAuthError } from '$lib/utils/api';
import { validateNewCookie } from '$lib/utils/auth';
import { error } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ fetch, locals }) => {
	if (!locals.user) {
		throw error(401);
	}

	const response = await fetch(`${env.BASE_API_URL}/oauth/logout`, {
		method: 'POST',
		credentials: 'include'
	});

	locals.user = undefined;
	locals.guilds = undefined;

	const cookie = response.headers.get('set-cookie');

	const result = validateNewCookie(cookie);
	if (!result) return sendToOAuthError();

	return new Response(undefined, {
		status: 302,
		headers: {
			location: '/',
			'set-cookie': cookie
		}
	});
};
