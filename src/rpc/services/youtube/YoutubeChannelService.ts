import { YoutubeChannelService, GetYoutubeChannelRequest, GetYoutubeChannelResponse } from '../../bot';
import { authenticated } from '#rpc/middlewares';
import { container } from '@sapphire/framework';
import { Code, ConnectError, HandlerContext } from '@bufbuild/connect';
import type { PartialMessage } from '@bufbuild/protobuf';
import type { ServiceImpl, ConnectRouter } from '@bufbuild/connect';

export function registerYoutubeChannelService(router: ConnectRouter) {
	router.service(YoutubeChannelService, new YoutubeChannelServiceImpl());
}

class YoutubeChannelServiceImpl implements ServiceImpl<typeof YoutubeChannelService> {
	@authenticated()
	public async getYoutubeChannel({ channelId }: GetYoutubeChannelRequest, { auth, error }: HandlerContext): Promise<GetYoutubeChannelResponse> {
		const { logger, youtube } = container;
		if (error) throw error;
		if (!auth) throw new ConnectError('Unauthenticated', Code.Unauthenticated);

		try {
			const channel = await youtube.channels.get({
				channelId
			});

			const data: PartialMessage<GetYoutubeChannelResponse> = {
				channel: channel ? { id: channel.id, name: channel.name, image: channel.image } : undefined
			};

			return new GetYoutubeChannelResponse(data);
		} catch (err: unknown) {
			logger.error(err);
			throw new ConnectError('Internal server error', Code.Internal);
		}
	}
}
