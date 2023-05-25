import { Code, ConnectError } from '@bufbuild/connect';

export class UnauthorizedError extends ConnectError {
	public constructor() {
		super('Unauthorized', Code.PermissionDenied);
	}
}
