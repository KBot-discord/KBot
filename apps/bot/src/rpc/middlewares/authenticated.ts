import { container } from '@sapphire/framework';
import { createMethodDecorator } from '@sapphire/decorators';
import { Code, ConnectError } from '@bufbuild/connect';
import type { HandlerContext } from '@bufbuild/connect';

export const authenticated = (): MethodDecorator => {
	return createMethodDecorator((_: any, __: any, descriptor: any) => {
		const method = descriptor.value;
		if (!method) throw new Error('Function preconditions require a [[value]].');
		if (typeof method !== 'function') throw new Error('Function preconditions can only be applied to functions.');

		// eslint-disable-next-line func-names
		descriptor.value = function (this: any, _: any, ctx: HandlerContext) {
			try {
				const cookie = ctx.requestHeader.get('cookie');
				if (cookie) {
					const authData = container.server.auth!.decrypt(cookie);
					ctx.auth = authData;

					if (authData && Date.now() + 86_400_000 >= authData.expires) {
						// TODO: refresh token
					}
				} else {
					ctx.auth = null;
					ctx.error = new ConnectError('Unauthenticated', Code.Unauthenticated);
				}
			} catch (err: unknown) {
				container.logger.error(err);
				ctx.auth = null;
				ctx.error = new ConnectError('Bad request', Code.Aborted);
			}

			return method.call(this, _, ctx);
		} as unknown as undefined;
	});
};
