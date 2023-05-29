import { handleGuildsRoute } from './hooks/guilds';
import { sequence } from '@sveltejs/kit/hooks';
import type { Handle } from '@sveltejs/kit';
import { env } from '$env/dynamic/public';
import { useClient, Clients } from '$rpc';

const protectedRoutes = ['/guilds', '/premium/manage'];

export const handleAll: Handle = async ({ event, resolve }) => {
	const cookie = event.cookies.get(env.PUBLIC_COOKIE!);
	if (!cookie) {
		if (protectedRoutes.some((route) => event.url.pathname.startsWith(route))) {
			return new Response(undefined, {
				status: 302,
				headers: { location: '/oauth/discord/login' }
			});
		}

		return resolve(event);
	}

	try {
		const userRes = await useClient(Clients.Discord) //
			.getDiscordUser(
				{}, //
				{ headers: { cookie } }
			);

		event.locals.user = userRes.user
			? { ...userRes.user } //
			: undefined;

		if (event.url.pathname.startsWith('/guilds')) {
			return handleGuildsRoute({ event, resolve });
		}
	} catch (err: unknown) {
		console.log(err);
		event.locals.user = undefined;
		event.locals.guilds = undefined;
		event.locals.guild = undefined;
	}

	return resolve(event);
};

export const handle: Handle = sequence(handleAll);
