import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { Guild } from '$lib/types/app';
import { useYoutubeSettingsServer, useYoutubeSubscriptionsServer } from '$rpc';
import { env } from '$env/dynamic/public';

const fetchYoutubeSettings = async (cookie: string, guild: Guild) => {
	const response = await useYoutubeSettingsServer() //
		.getYoutubeSettings(
			{ guildId: guild.id }, //
			{ headers: { cookie } }
		);

	return { ...response.settings };
};

const fetchYoutubeSubscriptions = async (cookie: string, guild: Guild) => {
	const response = await useYoutubeSubscriptionsServer() //
		.getGuildYoutubeSubscriptions(
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
		settings: fetchYoutubeSettings(cookie, locals.guild),
		subscriptions: fetchYoutubeSubscriptions(cookie, locals.guild)
	};
};
