import { KBotError } from '#structures/errors/KBotError';

export class ChannelPermissionsError extends KBotError {
	public constructor(message?: string) {
		super(message ?? 'Insufficient permissions for the channel', {
			name: 'ChannelPermissionsError',
			code: 'CHANNEL_PERMISSIONS'
		});
	}
}
