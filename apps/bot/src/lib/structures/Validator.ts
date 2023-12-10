import { ChannelValidator } from '#lib/structures/ChannelValidator';
import { ClientValidator } from '#lib/structures/ClientValidator';

export class Validator {
	public readonly channels;
	public readonly client;

	public constructor() {
		this.channels = new ChannelValidator();
		this.client = new ClientValidator();
	}
}
