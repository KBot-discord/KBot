import { Code, ConnectError } from '@bufbuild/connect';

export class UnauthenticatedError extends ConnectError {
	public constructor() {
		super('Unauthenticated', Code.Unauthenticated);
	}
}
