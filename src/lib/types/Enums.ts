export const KBotModules = {
	Core: 'CoreModule',
	Dev: 'DevModule',
	Events: 'EventModule',
	Moderation: 'ModerationModule',
	Utility: 'UtilityModule',
	Welcome: 'WelcomeModule',
	YouTube: 'YouTubeModule'
} as const;

export const KBotErrors = {
	WebhookError: 'webhookError',
	ChannelPermissions: 'channelPermissions'
} as const;

export const KBotErrorCodes = {
	ChannelPermissions: 'CHANNEL_PERMISSIONS',
	InvalidHex: 'INVALID_HEX',
	DiscordFetch: 'DISCORD_FETCH'
} as const;

export type KBotErrorCode = (typeof KBotErrorCodes)[keyof typeof KBotErrorCodes];
