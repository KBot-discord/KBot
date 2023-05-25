import { KBotError } from '#structures/errors/KBotError';
import type { Channel } from 'discord.js';

export type ChannelPermissionsErrorOptions = {
	channel?: Channel;
	message?: string;
	userMessage?: string;
};

export class ChannelPermissionsError extends KBotError {
	public override readonly userMessage: string;

	public readonly channel: Channel | undefined;

	public constructor(options: ChannelPermissionsErrorOptions = {}) {
		super(options.message ?? `Insufficient permissions for channel`, {
			name: 'ChannelPermissionsError',
			code: 'CHANNEL_PERMISSIONS'
		});

		this.userMessage = options.userMessage ?? 'I can not send messages in that channel.';
		this.channel = options.channel;
	}
}
