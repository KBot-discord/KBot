export const KBotModules = {
	Core: 'CoreModule' as const,
	Dev: 'DevModule' as const,
	Events: 'EventModule' as const,
	Moderation: 'ModerationModule' as const,
	Utility: 'UtilityModule' as const,
	Welcome: 'WelcomeModule' as const,
	YouTube: 'YouTubeModule' as const
};

export const KBotErrors = {
	WebhookError: 'webhookError' as const,
	ChannelPermissions: 'channelPermissions' as const,
	MissingSubcommandHandler: 'missingSubcommandHandler' as const
};

export const KBotErrorCodes = {
	ChannelPermissions: 'CHANNEL_PERMISSIONS',
	MissingSubcommandHandler: 'MISSING_SUBCOMMAND_HANDLER',
	InvalidHex: 'INVALID_HEX',
	DiscordFetch: 'DISCORD_FETCH'
} as const;

export type KBotErrorCode = (typeof KBotErrorCodes)[keyof typeof KBotErrorCodes];
