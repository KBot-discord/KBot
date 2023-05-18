import { authenticated } from '#rpc/middlewares';
import { canManageGuild } from '#utils/Discord';
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
import { Code, ConnectError, type HandlerContext } from '@bufbuild/connect';
import type { ServiceImpl, ConnectRouter } from '@bufbuild/connect';
import type { YoutubeSubscription } from '@kbotdev/proto';
import type { PartialMessage } from '@bufbuild/protobuf';

export function registerYoutubeSubscriptionService(router: ConnectRouter): void {
	router.service(YoutubeSubscriptionService, new YoutubeSubscriptionServiceImpl());
}

class YoutubeSubscriptionServiceImpl implements ServiceImpl<typeof YoutubeSubscriptionService> {
	@authenticated()
	public async createYoutubeSubscription(
		{ guildId, channelId }: CreateYoutubeSubscriptionRequest,
		{ auth, error }: HandlerContext
	): Promise<CreateYoutubeSubscriptionResponse> {
		const { logger, client, youtube } = container;
		if (error) throw error;
		if (!auth) throw new ConnectError('Unauthenticated', Code.Unauthenticated);

		const guild = client.guilds.cache.get(guildId);
		const member = await guild?.members.fetch(auth.id).catch(() => null);
		if (!guild || !member) throw new ConnectError('Bad request', Code.Aborted);

		const canManage = await canManageGuild(guild, member);
		if (!canManage) throw new ConnectError('Unauthorized', Code.PermissionDenied);

		try {
			const subscription = await youtube.subscriptions.upsert({
				guildId,
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
		} catch (err: unknown) {
			logger.error(err);
			throw new ConnectError('Internal server error', Code.Internal);
		}
	}

	@authenticated()
	public async updateYoutubeSubscription(
		{ guildId, channelId, message, role, discordChannel }: UpdateYoutubeSubscriptionRequest,
		{ auth, error }: HandlerContext
	): Promise<UpdateYoutubeSubscriptionResponse> {
		const { logger, client, youtube } = container;
		if (error) throw error;
		if (!auth) throw new ConnectError('Unauthenticated', Code.Unauthenticated);

		const guild = client.guilds.cache.get(guildId);
		const member = await guild?.members.fetch(auth.id).catch(() => null);
		if (!guild || !member) throw new ConnectError('Bad request', Code.Aborted);

		const canManage = await canManageGuild(guild, member);
		if (!canManage) throw new ConnectError('Unauthorized', Code.PermissionDenied);

		try {
			const subscription = await youtube.subscriptions.upsert(
				{ guildId, channelId },
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
		} catch (err: unknown) {
			logger.error(err);
			throw new ConnectError('Internal server error', Code.Internal);
		}
	}

	@authenticated()
	public async deleteYoutubeSubscription(
		{ guildId, channelId }: DeleteYoutubeSubscriptionRequest,
		{ auth, error }: HandlerContext
	): Promise<DeleteYoutubeSubscriptionResponse> {
		const { logger, client, youtube } = container;
		if (error) throw error;
		if (!auth) throw new ConnectError('Unauthenticated', Code.Unauthenticated);

		const guild = client.guilds.cache.get(guildId);
		const member = await guild?.members.fetch(auth.id).catch(() => null);
		if (!guild || !member) throw new ConnectError('Bad request', Code.Aborted);

		const canManage = await canManageGuild(guild, member);
		if (!canManage) throw new ConnectError('Unauthorized', Code.PermissionDenied);

		try {
			const subscription = await youtube.subscriptions.delete({ guildId, channelId });

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
		} catch (err: unknown) {
			logger.error(err);
			throw new ConnectError('Internal server error', Code.Internal);
		}
	}

	@authenticated()
	public async getGuildYoutubeSubscriptions(
		{ guildId }: GetGuildYoutubeSubscriptionsRequest,
		{ auth, error }: HandlerContext
	): Promise<GetGuildYoutubeSubscriptionsResponse> {
		const { logger, client, youtube } = container;
		if (error) throw error;
		if (!auth) throw new ConnectError('Unauthenticated', Code.Unauthenticated);

		const guild = client.guilds.cache.get(guildId);
		const member = await guild?.members.fetch(auth.id).catch(() => null);
		if (!guild || !member) throw new ConnectError('Bad request', Code.Aborted);

		const canManage = await canManageGuild(guild, member);
		if (!canManage) throw new ConnectError('Unauthorized', Code.PermissionDenied);

		try {
			const subscriptions = await youtube.subscriptions.getByGuild({ guildId });

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
		} catch (err: unknown) {
			logger.error(err);
			throw new ConnectError('Internal server error', Code.Internal);
		}
	}
}
