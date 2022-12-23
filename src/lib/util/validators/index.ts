import { ChannelValidator } from './channel';

export class Validator {
	public readonly channels;

	public constructor() {
		this.channels = new ChannelValidator();
	}
}
