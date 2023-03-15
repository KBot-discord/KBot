import { authenticated } from '#rpc/middlewares';
import { GetTwitchAccountRequest, TwitchAccountService, GetTwitchAccountResponse } from '@kbotdev/proto';
import { container } from '@sapphire/framework';
import { Code, ConnectError, HandlerContext } from '@bufbuild/connect';
import type { PartialMessage } from '@bufbuild/protobuf';
import type { ServiceImpl, ConnectRouter } from '@bufbuild/connect';

export function registerTwitchAccountService(router: ConnectRouter) {
	router.service(TwitchAccountService, new TwitchAccountlServiceImpl());
}

class TwitchAccountlServiceImpl implements ServiceImpl<typeof TwitchAccountService> {
	@authenticated()
	public async getTwitchAccount({ accountId }: GetTwitchAccountRequest, { auth, error }: HandlerContext): Promise<GetTwitchAccountResponse> {
		const { logger, twitch } = container;
		if (error) throw error;
		if (!auth) throw new ConnectError('Unauthenticated', Code.Unauthenticated);

		try {
			const account = await twitch.accounts.get({
				accountId
			});

			const data: PartialMessage<GetTwitchAccountResponse> = {
				account: account ? { id: account.id, name: account.name, image: account.image } : undefined
			};

			return new GetTwitchAccountResponse(data);
		} catch (err: unknown) {
			logger.error(err);
			throw new ConnectError('Internal server error', Code.Internal);
		}
	}
}
