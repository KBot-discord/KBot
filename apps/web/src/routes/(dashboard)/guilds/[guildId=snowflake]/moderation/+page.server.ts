import { redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { Guild } from '$lib/types/app';
import { env } from '$env/dynamic/public';
import { Clients, useClient } from '$rpc';
import type { ModerationSettings } from '@kbotdev/proto';

const fetchModerationSettings = async (
	cookie: string,
	guild: Guild
): Promise<Partial<ModerationSettings>> => {
	const response = await useClient(Clients.ModerationSettings) //
		.getModerationSettings(
			{ guildId: guild.id }, //
			{ headers: { cookie } }
		);

	return { ...response.settings };
};

export const load: PageServerLoad = ({ cookies, locals }) => {
	const cookie = cookies.get(env.PUBLIC_COOKIE!);
	if (!cookie || !locals.guild) {
		throw redirect(302, '/guilds');
	}

	return {
		settings: fetchModerationSettings(cookie, locals.guild)
	};
};

export const actions: Actions = {
	module: async ({ request }) => {
		const data = await request.formData();

		if (!data.get('module-enabled')) {
			data.set('module-enabled', 'false');
		}

		console.log(data);
	},
	antihoist: async ({ request }) => {
		const data = await request.formData();

		if (!data.get('anti-hoist')) {
			data.set('anti-hoist', 'false');
		}

		console.log(data);
	},
	report: async ({ request }) => {
		const data = await request.formData();

		console.log(data);
	},
	minage: async ({ request }) => {
		const data = await request.formData();

		console.log(data);
	}
};
