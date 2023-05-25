import { BadRequestError, UnauthenticatedError } from '#rpc/errors';
import { Result, container } from '@sapphire/framework';
import { createMethodDecorator } from '@sapphire/decorators';
import { ConnectError } from '@bufbuild/connect';
import type { HandlerContext } from '@bufbuild/connect';

export const authenticated = (): MethodDecorator => {
	return createMethodDecorator((_: any, __: any, descriptor: any) => {
		const method = descriptor.value;
		if (!method || typeof method !== 'function') {
			throw new Error('This can only be used on class methods');
		}

		descriptor.value = function value(this: any, _: any, ctx: HandlerContext): any {
			const result = Result.from(() => {
				const cookie = ctx.requestHeader.get('cookie');
				if (!cookie) throw new UnauthenticatedError();

				const authData = container.server.auth!.decrypt(cookie);
				if (!authData) throw new UnauthenticatedError();

				ctx.auth = authData;

				if (Date.now() + 86_400_000 >= authData.expires) {
					// TODO: refresh token
				}
			});

			if (result.isErr()) {
				result.inspectErr((error) => {
					if (error instanceof ConnectError) {
						throw error;
					} else {
						container.logger.sentryError(error);
						throw new BadRequestError();
					}
				});
			}

			return method.call(this, _, ctx);
		} as unknown as undefined;
	});
};
