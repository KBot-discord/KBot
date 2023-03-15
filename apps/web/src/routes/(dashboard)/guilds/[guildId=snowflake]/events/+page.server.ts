import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { Guild } from '$lib/types/app';
import { env } from '$env/dynamic/public';
import { useEventSettingsServer, useKaraokeEventServer } from '$rpc';

const fetchEventSettings = async (cookie: string, guild: Guild) => {
	const response = await useEventSettingsServer() //
		.getEventSettings(
			{ guildId: guild.id }, //
			{ headers: { cookie } }
		);

	return { ...response.settings };
};

const fetchKaraokeScheduledEvents = async (cookie: string, guild: Guild) => {
	const response = await useKaraokeEventServer() //
		.getKaraokeScheduledEvents(
			{ guildId: guild.id }, //
			{ headers: { cookie } }
		);

	return response.events.map((event) => ({ ...event }));
};

export const load: PageServerLoad = ({ cookies, locals }) => {
	const cookie = cookies.get(env.PUBLIC_COOKIE);
	if (!cookie || !locals.guild) {
		throw redirect(302, '/guilds');
	}

	return {
		settings: fetchEventSettings(cookie, locals.guild),
		karaokeEvents: fetchKaraokeScheduledEvents(cookie, locals.guild)
	};
};
