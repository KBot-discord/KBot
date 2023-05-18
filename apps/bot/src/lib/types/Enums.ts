export const enum KBotEvents {
	YoutubeReactionRole = 'youtubeReactionRole'
}

export const enum KBotErrors {
	ChannelPermissions = 'channelPermissions',
	UnknownCommand = 'unknownCommand'
}

export const KBOT_ERRORS = ['CHANNEL_PERMISSIONS', 'UNKNOWN_COMMAND', 'INVALID_HEX'] as const;

export type KBotErrorCode = (typeof KBOT_ERRORS)[number];
