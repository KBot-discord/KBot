import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { Guild } from '$lib/types/app';
import { env } from '$env/dynamic/public';
import { useClient, Clients } from '$rpc';

const fetchWelcomeSettings = async (cookie: string, guild: Guild) => {
	const response = await useClient(Clients.WelcomeSettings) //
		.getWelcomeSettings(
			{ guildId: guild.id }, //
			{ headers: { cookie } }
		);

	return { ...response.settings };
};

export const load: PageServerLoad = ({ cookies, locals }) => {
	const cookie = cookies.get(env.PUBLIC_COOKIE);
	if (!cookie || !locals.guild) {
		throw redirect(302, '/guilds');
	}

	return {
		settings: fetchWelcomeSettings(cookie, locals.guild)
	};
};
