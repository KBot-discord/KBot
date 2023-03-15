import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import type { Guild } from '$lib/types/app';
import { useCoreSettingsServer } from '$rpc';
import { PUBLIC_COOKIE } from '$env/static/public';

const fetchCoreSettings = async (cookie: string, guild: Guild) => {
	const response = await useCoreSettingsServer() //
		.getCoreSettings(
			{ guildId: guild.id }, //
			{ headers: { cookie } }
		);

	return { ...response.settings };
};

export const load: PageServerLoad = ({ locals, cookies }) => {
	const cookie = cookies.get(PUBLIC_COOKIE);
	if (!cookie || !locals.guild) {
		throw redirect(302, '/guilds');
	}

	return {
		settings: fetchCoreSettings(cookie, locals.guild)
	};
};

export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		console.log(data);
	}
};
