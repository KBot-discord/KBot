import { ChannelValidator } from './channel';
import { ClientValidator } from '#utils/validators/client';

export class Validator {
	public readonly channels;
	public readonly client;

	public constructor() {
		this.channels = new ChannelValidator();
		this.client = new ClientValidator();
	}
}
