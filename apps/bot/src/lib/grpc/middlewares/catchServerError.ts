import { InternalServerError } from '#grpc/errors';
import { Result, container } from '@sapphire/framework';
import { createMethodDecorator } from '@sapphire/decorators';
import { ConnectError } from '@bufbuild/connect';
import type { HandlerContext } from '@bufbuild/connect';

/**
 * Catches any unhandled errors and returns them as {@link InternalServerError}
 */
export const catchServerError = (): MethodDecorator => {
	return createMethodDecorator((_target: any, _property: any, descriptor: any) => {
		const method = descriptor.value;
		if (typeof method !== 'function') {
			throw new Error('This can only be used on class methods');
		}

		descriptor.value = async function value(this: any, _: any, ctx: HandlerContext): Promise<any> {
			const result = await Result.fromAsync(async () => method.call(this, _, ctx));

			return result.match({
				ok: (data) => data,
				err: (error) => {
					if (error instanceof ConnectError) {
						throw error;
					} else {
						container.logger.sentryError(error);
						throw new InternalServerError();
					}
				}
			});
		};
	});
};
