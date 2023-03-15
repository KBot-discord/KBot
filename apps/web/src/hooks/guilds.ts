import type { Guild } from '$lib/types/app';
import type { Handle } from '@sveltejs/kit';
import { PUBLIC_COOKIE } from '$env/static/public';
import { useDiscordServer } from '$rpc';

export const handleGuildsRoute: Handle = async ({ event, resolve }) => {
	const cookie = event.cookies.get(PUBLIC_COOKIE);
	if (!cookie || !event.locals.user) {
		return new Response(undefined, {
			status: 302,
			headers: { location: '/oauth/discord/login' }
		});
	}

	const guildsRes = await useDiscordServer() //
		.getDiscordGuilds(
			{}, //
			{ headers: { cookie } }
		);

	const guilds = new Map<string, Guild>();
	for (const guild of guildsRes.guilds) {
		guilds.set(guild.id, { ...guild });
	}

	event.locals.guilds = guilds;

	if (event.params.guildId) {
		const guild = guilds.get(event.params.guildId);

		if (!guild) {
			return new Response(undefined, {
				status: 302,
				headers: { location: '/guilds' }
			});
		}

		event.locals.guild = guild;
	}

	return resolve(event);
};
