import { ChannelValidator } from './channel';
import { ModerationActionValidator } from '#utils/validators/moderation';
import { ClientValidator } from '#utils/validators/client';

export class Validator {
	public readonly channels;
	public readonly client;
	public readonly moderation;

	public constructor() {
		this.channels = new ChannelValidator();
		this.client = new ClientValidator();
		this.moderation = new ModerationActionValidator();
	}
}
