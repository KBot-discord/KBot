import { Code, ConnectError } from '@bufbuild/connect';

export class BadRequestError extends ConnectError {
	public constructor() {
		super('Bad Request', Code.Aborted);
	}
}
