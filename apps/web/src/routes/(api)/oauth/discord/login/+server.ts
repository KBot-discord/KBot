import { redirect, type RequestHandler } from '@sveltejs/kit';
import { DiscordOAuthUrl } from '$lib/utils/constants';

export const GET: RequestHandler = () => {
	throw redirect(302, DiscordOAuthUrl);
};
