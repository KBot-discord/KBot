export const KBotErrors = {
	WebhookError: 'webhookError' as const,
	ChannelPermissions: 'channelPermissions' as const,
	MissingSubcommandHandler: 'missingSubcommandHandler' as const
};

export const KBOT_ERRORS = [
	'CHANNEL_PERMISSIONS', //
	'MISSING_SUBCOMMAND_HANDLER',
	'INVALID_HEX'
] as const;

export type KBotErrorCode = (typeof KBOT_ERRORS)[number];
