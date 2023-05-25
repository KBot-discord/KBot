import { authenticated, catchServerError } from '#rpc/middlewares';
import { YoutubeChannelService, GetYoutubeChannelRequest, GetYoutubeChannelResponse } from '@kbotdev/proto';
import { container } from '@sapphire/framework';
import type { ServiceImpl, ConnectRouter } from '@bufbuild/connect';
import type { PartialMessage } from '@bufbuild/protobuf';

export function registerYoutubeChannelService(router: ConnectRouter): void {
	router.service(YoutubeChannelService, new YoutubeChannelServiceImpl());
}

class YoutubeChannelServiceImpl implements ServiceImpl<typeof YoutubeChannelService> {
	@authenticated()
	@catchServerError()
	public async getYoutubeChannel({ channelId }: GetYoutubeChannelRequest): Promise<GetYoutubeChannelResponse> {
		const { prisma } = container;

		const channel = await prisma.holodexChannel.findUnique({
			where: { youtubeId: channelId }
		});

		const data: PartialMessage<GetYoutubeChannelResponse> = {
			channel: channel ? { id: channel.youtubeId, name: channel.name, image: channel.image ?? undefined } : undefined
		};

		return new GetYoutubeChannelResponse(data);
	}
}
