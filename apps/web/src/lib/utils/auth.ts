import { PUBLIC_COOKIE } from '$env/static/public';

export function validateNewCookie(cookie: string | null): cookie is string {
	if (!cookie) return false;

	const options = cookie.split('; ');
	if (options.length !== 5) return false;

	const pair = options[0].split('=');
	if (pair.length !== 2 || pair[0] !== PUBLIC_COOKIE) return false;

	return true;
}
