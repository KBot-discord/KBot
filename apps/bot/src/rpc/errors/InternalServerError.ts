import { Code, ConnectError } from '@bufbuild/connect';

export class InternalServerError extends ConnectError {
	public constructor() {
		super('Internal server error', Code.Internal);
	}
}
