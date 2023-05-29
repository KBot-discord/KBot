import { BadRequestError, UnauthenticatedError } from '#grpc/errors';
import { Result, container } from '@sapphire/framework';
import { createMethodDecorator } from '@sapphire/decorators';
import { ConnectError } from '@bufbuild/connect';
import { FetchResultTypes, fetch } from '@sapphire/fetch';
import { MimeTypes } from '@sapphire/plugin-api';
import { Time } from '@sapphire/duration';
import { OAuth2Routes } from 'discord.js';
import type { RESTPostOAuth2AccessTokenResult } from 'discord.js';
import type { HandlerContext } from '@bufbuild/connect';

export const authenticated = (): MethodDecorator => {
	return createMethodDecorator((_: any, __: any, descriptor: any) => {
		const method = descriptor.value;
		if (!method || typeof method !== 'function') {
			throw new Error('This can only be used on class methods');
		}

		descriptor.value = async function value(this: any, req: any, ctx: HandlerContext): Promise<any> {
			const { server, logger } = container;

			const result = await Result.fromAsync(async () => {
				const cookie = ctx.requestHeader.get('cookie');
				if (!cookie) throw new UnauthenticatedError();

				const authData = server.auth!.decrypt(cookie);
				if (!authData) throw new UnauthenticatedError();

				if (Date.now() + Time.Day >= authData.expires) {
					const response = await refreshToken(authData.refresh);

					response.match({
						ok: (response) => {
							const data = server.auth!.encrypt({
								id: authData.id,
								token: response.access_token,
								refresh: response.refresh_token,
								expires: Date.now() + response.expires_in * 1000
							});

							const cookie = createCookie(server.auth!.cookie, data, {
								maxAge: response.expires_in
							});

							ctx.responseHeader.set('set-cookie', cookie);
						},
						err: (error) => {
							logger.sentryError(error);
						}
					});
				}

				ctx.auth = authData;
			});

			return result.match({
				ok: () => method.call(this, req, ctx),
				err: (error) => {
					if (error instanceof ConnectError) {
						throw error;
					} else {
						container.logger.sentryError(error);
						throw new BadRequestError();
					}
				}
			});
		};
	});
};

function createCookie(name: string, data: string, { maxAge }: { maxAge: number }): string {
	return `${name}=${data}; Max-Age=${maxAge}`;
}

async function refreshToken(refreshToken: string): Promise<Result<RESTPostOAuth2AccessTokenResult, unknown>> {
	const { server } = container;

	return Result.fromAsync(async () => {
		return fetch<RESTPostOAuth2AccessTokenResult>(
			OAuth2Routes.tokenURL,
			{
				method: 'POST',
				body: JSON.stringify({
					client_id: server.auth!.id,
					client_secret: server.auth!.secret,
					grant_type: 'refresh_token',
					refresh_token: refreshToken,
					redirect_uri: server.auth!.redirect,
					scope: server.auth!.scopes
				}),
				headers: {
					'Content-Type': MimeTypes.ApplicationFormUrlEncoded
				}
			},
			FetchResultTypes.JSON
		);
	});
}
