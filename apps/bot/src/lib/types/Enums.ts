export const KBotErrors = {
	ChannelPermissions: 'channelPermissions',
	UnknownCommand: 'unknownCommand'
} as const;

export const KBOT_ERRORS = ['CHANNEL_PERMISSIONS', 'UNKNOWN_COMMAND', 'INVALID_HEX'] as const;

export type KBotErrorCode = (typeof KBOT_ERRORS)[number];
