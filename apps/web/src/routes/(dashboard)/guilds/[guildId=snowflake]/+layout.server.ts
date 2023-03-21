import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import type { Guild } from '$lib/types/app';
import { env } from '$env/dynamic/public';
import { useClient, Clients } from '$rpc';

const fetchTextChannels = async (cookie: string, guild: Guild) => {
	const response = await useClient(Clients.Discord) //
		.getDiscordTextChannels(
			{ guildId: guild.id }, //
			{ headers: { cookie } }
		);

	return response.channels.map((channel) => ({ ...channel }));
};

const fetchVoiceChannels = async (cookie: string, guild: Guild) => {
	const response = await useClient(Clients.Discord) //
		.getDiscordVoiceChannels(
			{ guildId: guild.id }, //
			{ headers: { cookie } }
		);

	return response.channels.map((channel) => ({ ...channel }));
};

const fetchRoles = async (cookie: string, guild: Guild) => {
	const response = await useClient(Clients.Discord) //
		.getDiscordRoles(
			{ guildId: guild.id }, //
			{ headers: { cookie } }
		);

	return response.roles.map((channel) => ({ ...channel }));
};

export const load: LayoutServerLoad = ({ locals, cookies }) => {
	const cookie = cookies.get(env.PUBLIC_COOKIE);
	if (!cookie || !locals.guild) {
		throw redirect(302, '/guilds');
	}

	return {
		guild: locals.guild,
		textChannels: fetchTextChannels(cookie, locals.guild),
		voiceChannels: fetchVoiceChannels(cookie, locals.guild),
		roles: fetchRoles(cookie, locals.guild)
	};
};
