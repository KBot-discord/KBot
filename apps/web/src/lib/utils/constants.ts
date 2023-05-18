import { env } from '$env/dynamic/private';

const discordOAuthUrl = new URL('https://discord.com/oauth2/authorize');

discordOAuthUrl.search = new URLSearchParams([
	['redirect_uri', `${env.BASE_WEB_URL!}/oauth/discord/callback`],
	['response_type', 'code'],
	// ['prompt', 'none'],
	['scope', ['identify', 'guilds'].join(' ')],
	['client_id', env.DISCORD_ID!]
]).toString();

export const DiscordOAuthUrl = discordOAuthUrl.toString();
