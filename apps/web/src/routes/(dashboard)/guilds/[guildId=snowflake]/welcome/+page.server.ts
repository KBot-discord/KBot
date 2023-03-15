import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { Guild } from '$lib/types/app';
import { useWelcomeSettingsServer } from '$rpc/WelcomeSettings';
import { env } from '$env/dynamic/public';

const fetchWelcomeSettings = async (cookie: string, guild: Guild) => {
	const response = await useWelcomeSettingsServer() //
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
