import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import type { Guild } from '$lib/types/app';
import { PUBLIC_COOKIE } from '$env/static/public';
import { useDiscordServer } from '$rpc';

const fetchTextChannels = async (cookie: string, guild: Guild) => {
	const response = await useDiscordServer() //
		.getDiscordTextChannels(
			{ guildId: guild.id }, //
			{ headers: { cookie } }
		);

	return response.channels.map((channel) => ({ ...channel }));
};

const fetchVoiceChannels = async (cookie: string, guild: Guild) => {
	const response = await useDiscordServer() //
		.getDiscordVoiceChannels(
			{ guildId: guild.id }, //
			{ headers: { cookie } }
		);

	return response.channels.map((channel) => ({ ...channel }));
};

const fetchRoles = async (cookie: string, guild: Guild) => {
	const response = await useDiscordServer() //
		.getDiscordRoles(
			{ guildId: guild.id }, //
			{ headers: { cookie } }
		);

	return response.roles.map((channel) => ({ ...channel }));
};

export const load: LayoutServerLoad = ({ locals, cookies }) => {
	const cookie = cookies.get(PUBLIC_COOKIE);
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