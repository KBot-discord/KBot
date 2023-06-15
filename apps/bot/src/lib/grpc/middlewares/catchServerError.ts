import { InternalServerError } from '#grpc/errors';
import { isFunction } from '#utils/functions';
import { Result, container } from '@sapphire/framework';
import { createClassDecorator } from '@sapphire/decorators';
import { ConnectError } from '@bufbuild/connect';
import type { Piece } from '@sapphire/framework';
import type { HandlerContext } from '@bufbuild/connect';
import type { Ctor } from '@sapphire/utilities';

/**
 * Catches any unhandled errors and returns them as {@link InternalServerError}
 */
export const catchServerError = (): ClassDecorator => {
	return createClassDecorator((target: Ctor<ConstructorParameters<typeof Piece>, Piece>) => {
		const descriptors = Object.getOwnPropertyDescriptors(target.prototype);

		for (const [propertyName, descriptor] of Object.entries(descriptors)) {
			const method = descriptor.value;

			const isMethod = isFunction(method) && propertyName !== 'constructor';
			if (!isMethod) continue;

			descriptor.value = async function value(this: any, req: any, ctx: HandlerContext): Promise<any> {
				const result = await Result.fromAsync(async () => method.call(this, req, ctx));

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

			Object.defineProperty(target.prototype, propertyName, descriptor);
		}
	});
};
