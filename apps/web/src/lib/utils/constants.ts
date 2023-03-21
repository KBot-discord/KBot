import { env } from '$env/dynamic/private';

const discordOAuthUrl = new URL('https://discord.com/oauth2/authorize');

discordOAuthUrl.search = new URLSearchParams([
	//@ts-ignore
	['redirect_uri', `${env.BASE_WEB_URL}/oauth/discord/callback`],
	//@ts-ignore
	['response_type', 'code'],
	// ['prompt', 'none'],
	//@ts-ignore
	['scope', ['identify', 'guilds'].join(' ')],
	//@ts-ignore
	['client_id', env.DISCORD_ID]
]).toString();

export const DiscordOAuthUrl = discordOAuthUrl.toString();
