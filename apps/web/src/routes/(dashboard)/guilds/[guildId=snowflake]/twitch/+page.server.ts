import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { Guild } from '$lib/types/app';
import { useTwitchSettingsServer, useTwitchSubscriptionsServer } from '$rpc';
import { env } from '$env/dynamic/public';

const fetchTwitchSettings = async (cookie: string, guild: Guild) => {
	const response = await useTwitchSettingsServer() //
		.getTwitchSettings(
			{ guildId: guild.id }, //
			{ headers: { cookie } }
		);

	return { ...response.settings };
};

const fetchTwitchSubscriptions = async (cookie: string, guild: Guild) => {
	const response = await useTwitchSubscriptionsServer() //
		.getGuildTwitchSubscriptions(
			{ guildId: guild.id }, //
			{ headers: { cookie } }
		);

	return response.subscriptions.map((subscription) => ({ ...subscription }));
};

export const load: PageServerLoad = ({ cookies, locals }) => {
	const cookie = cookies.get(env.PUBLIC_COOKIE);
	if (!cookie || !locals.guild) {
		throw redirect(302, '/guilds');
	}

	return {
		settings: fetchTwitchSettings(cookie, locals.guild),
		subscriptions: fetchTwitchSubscriptions(cookie, locals.guild)
	};
};
