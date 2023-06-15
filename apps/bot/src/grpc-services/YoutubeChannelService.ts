import { authenticated, catchServerError } from '#grpc/middlewares';
import { gRPCService } from '#plugins/grpc';
import { GetYoutubeChannelRequest, GetYoutubeChannelResponse, YoutubeChannelService } from '@kbotdev/proto';
import { container } from '@sapphire/framework';
import type { ConnectRouter, ServiceImpl } from '@bufbuild/connect';
import type { PartialMessage } from '@bufbuild/protobuf';

@catchServerError()
export class YoutubeChannelServiceImpl extends gRPCService implements ServiceImpl<typeof YoutubeChannelService> {
	public register(router: ConnectRouter): void {
		router.service(YoutubeChannelService, this);
	}

	@authenticated()
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
