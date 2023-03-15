import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { sendToOAuthError } from '$lib/utils/api';
import { validateNewCookie } from '$lib/utils/auth';

export const GET: RequestHandler = async ({ fetch, locals }) => {
	const response = await fetch(`${env.BASE_API_URL}/oauth/logout`, {
		method: 'POST',
		credentials: 'include',
		headers: { 'Content-Type': 'application/json' }
	});

	locals.user = undefined;
	locals.guilds = undefined;

	const newCookie = response.headers.get('set-cookie');

	const result = validateNewCookie(newCookie);
	if (!result) return sendToOAuthError();

	return new Response(undefined, {
		status: 302,
		headers: {
			location: '/',
			'set-cookie': newCookie
		}
	});
};
