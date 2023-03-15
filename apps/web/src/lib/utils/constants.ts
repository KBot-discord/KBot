import { PUBLIC_BASE_WEB_URL, PUBLIC_DISCORD_ID } from '$env/static/public';

const discordOAuthUrl = new URL('https://discord.com/oauth2/authorize');

discordOAuthUrl.search = new URLSearchParams([
	['redirect_uri', `${PUBLIC_BASE_WEB_URL}/oauth/discord/callback`],
	['response_type', 'code'],
	// ['prompt', 'none'],
	['scope', ['identify', 'guilds'].join(' ')],
	['client_id', PUBLIC_DISCORD_ID]
]).toString();

export const DiscordOAuthUrl = discordOAuthUrl.toString();
