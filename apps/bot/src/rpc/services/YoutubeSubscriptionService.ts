import { authenticated, catchServerError } from '#rpc/middlewares';
import { assertManagePermissions } from '#rpc/utils';
import {
	YoutubeSubscriptionService,
	CreateYoutubeSubscriptionRequest,
	CreateYoutubeSubscriptionResponse,
	UpdateYoutubeSubscriptionRequest,
	UpdateYoutubeSubscriptionResponse,
	DeleteYoutubeSubscriptionRequest,
	GetGuildYoutubeSubscriptionsRequest,
	DeleteYoutubeSubscriptionResponse,
	GetGuildYoutubeSubscriptionsResponse,
	fromOptional
} from '@kbotdev/proto';
import { container } from '@sapphire/framework';
import * as connect from '@bufbuild/connect';
import type { ServiceImpl, ConnectRouter } from '@bufbuild/connect';
import type { YoutubeSubscription } from '@kbotdev/proto';
import type { PartialMessage } from '@bufbuild/protobuf';

export function registerYoutubeSubscriptionService(router: ConnectRouter): void {
	router.service(YoutubeSubscriptionService, new YoutubeSubscriptionServiceImpl());
}

class YoutubeSubscriptionServiceImpl implements ServiceImpl<typeof YoutubeSubscriptionService> {
	@authenticated()
	@catchServerError()
	public async createYoutubeSubscription(
		{ guildId, channelId }: CreateYoutubeSubscriptionRequest,
		{ auth }: connect.HandlerContext
	): Promise<CreateYoutubeSubscriptionResponse> {
		const { youtube } = container;

		return assertManagePermissions(guildId, auth, async ({ guild }) => {
			const subscription = await youtube.subscriptions.upsert({
				guildId: guild.id,
				channelId
			});

			const data: PartialMessage<CreateYoutubeSubscriptionResponse> = {
				subscription: {
					channelId: subscription.channel.youtubeId,
					channelName: subscription.channel.name,
					channelImage: subscription.channel.image ?? undefined,
					message: subscription.message ?? undefined,
					role: subscription.roleId ?? undefined,
					discordChannel: subscription.discordChannelId ?? undefined
				}
			};

			return new CreateYoutubeSubscriptionResponse(data);
		});
	}

	@authenticated()
	@catchServerError()
	public async updateYoutubeSubscription(
		{ guildId, channelId, message, role, discordChannel }: UpdateYoutubeSubscriptionRequest,
		{ auth }: connect.HandlerContext
	): Promise<UpdateYoutubeSubscriptionResponse> {
		const { youtube } = container;

		return assertManagePermissions(guildId, auth, async ({ guild }) => {
			const subscription = await youtube.subscriptions.upsert(
				{ guildId: guild.id, channelId },
				{
					message: fromOptional(message),
					roleId: fromOptional(role),
					discordChannelId: fromOptional(discordChannel)
				}
			);

			const data: PartialMessage<UpdateYoutubeSubscriptionResponse> = {
				subscription: {
					channelId: subscription.channel.youtubeId,
					channelName: subscription.channel.name,
					channelImage: subscription.channel.image ?? undefined,
					message: subscription.message ?? undefined,
					role: subscription.roleId ?? undefined,
					discordChannel: subscription.discordChannelId ?? undefined
				}
			};

			return new UpdateYoutubeSubscriptionResponse(data);
		});
	}

	@authenticated()
	@catchServerError()
	public async deleteYoutubeSubscription(
		{ guildId, channelId }: DeleteYoutubeSubscriptionRequest,
		{ auth }: connect.HandlerContext
	): Promise<DeleteYoutubeSubscriptionResponse> {
		const { youtube } = container;

		return assertManagePermissions(guildId, auth, async ({ guild }) => {
			const subscription = await youtube.subscriptions.delete({ guildId: guild.id, channelId });

			const data: PartialMessage<DeleteYoutubeSubscriptionResponse> = {
				subscription: subscription
					? {
							channelId: subscription.channel.youtubeId,
							channelName: subscription.channel.name,
							channelImage: subscription.channel.image ?? undefined,
							message: subscription.message ?? undefined,
							role: subscription.roleId ?? undefined,
							discordChannel: subscription.discordChannelId ?? undefined
					  }
					: undefined
			};

			return new DeleteYoutubeSubscriptionResponse(data);
		});
	}

	@authenticated()
	@catchServerError()
	public async getGuildYoutubeSubscriptions(
		{ guildId }: GetGuildYoutubeSubscriptionsRequest,
		{ auth }: connect.HandlerContext
	): Promise<GetGuildYoutubeSubscriptionsResponse> {
		const { youtube } = container;

		return assertManagePermissions(guildId, auth, async ({ guild }) => {
			const subscriptions = await youtube.subscriptions.getByGuild({ guildId: guild.id });

			const data: Partial<YoutubeSubscription>[] = subscriptions.map((subscription) => {
				return {
					channelId: subscription.channel.youtubeId,
					channelName: subscription.channel.name,
					channelImage: subscription.channel.image ?? undefined,
					message: subscription.message ?? undefined,
					role: subscription.roleId ?? undefined,
					discordChannel: subscription.discordChannelId ?? undefined
				};
			});

			return new GetGuildYoutubeSubscriptionsResponse({ subscriptions: data });
		});
	}
}
