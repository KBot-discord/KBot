import { redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { Guild } from '$lib/types/app';
import { env } from '$env/dynamic/public';
import { useModerationCasesServer, useModerationSettingsServer } from '$rpc';

const fetchModerationSettings = async (cookie: string, guild: Guild) => {
	const response = await useModerationSettingsServer() //
		.getModerationSettings(
			{ guildId: guild.id }, //
			{ headers: { cookie } }
		);

	return { ...response.settings };
};

const fetchModerationCases = async (cookie: string, guild: Guild) => {
	const response = await useModerationCasesServer() //
		.getGuildModerationCases(
			{ guildId: guild.id }, //
			{ headers: { cookie } }
		);

	return response.cases.map((moderationCase) => ({ ...moderationCase }));
};

export const load: PageServerLoad = ({ cookies, locals }) => {
	const cookie = cookies.get(env.PUBLIC_COOKIE);
	if (!cookie || !locals.guild) {
		throw redirect(302, '/guilds');
	}

	return {
		settings: fetchModerationSettings(cookie, locals.guild),
		cases: fetchModerationCases(cookie, locals.guild)
	};
};

export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		console.log(data);
	}
};
