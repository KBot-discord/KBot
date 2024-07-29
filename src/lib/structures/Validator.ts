import { ChannelValidator } from './ChannelValidator.js';
import { ClientValidator } from './ClientValidator.js';

export class Validator {
	public readonly channels;
	public readonly client;

	public constructor() {
		this.channels = new ChannelValidator();
		this.client = new ClientValidator();
	}
}
