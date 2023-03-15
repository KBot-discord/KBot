import type { RequestHandler } from './$types';
import type { TransformedLoginData } from '$lib/types/discord';
import { PUBLIC_BASE_API_URL, PUBLIC_BASE_WEB_URL } from '$env/static/public';
import { sendToHome, sendToOAuthError } from '$lib/utils/api';
import { validateNewCookie } from '$lib/utils/auth';

export const GET: RequestHandler = async ({ url, fetch }) => {
	const code = url.searchParams.get('code') ?? null;
	if (!code) return sendToHome();

	try {
		const response = await fetch(`${PUBLIC_BASE_API_URL}/oauth/callback`, {
			method: 'POST',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				code,
				redirectUri: `${PUBLIC_BASE_WEB_URL}/oauth/discord/callback`
			})
		});

		const logindata = (await response.json()) as TransformedLoginData;
		const newCookie = response.headers.get('set-cookie');

		const result = validateNewCookie(newCookie);
		if (!result || !logindata.user) return sendToOAuthError();

		return new Response(undefined, {
			status: 302,
			headers: {
				location: '/',
				'set-cookie': newCookie
			}
		});
	} catch (err: unknown) {
		console.error(err);
		return sendToOAuthError();
	}
};
