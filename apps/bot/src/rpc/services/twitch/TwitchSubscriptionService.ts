import { authenticated } from '#rpc/middlewares';
import { canManageGuild } from '#utils/Discord';
import {
	TwitchSubscriptionService,
	CreateTwitchSubscriptionRequest,
	CreateTwitchSubscriptionResponse,
	UpdateTwitchSubscriptionRequest,
	DeleteTwitchSubscriptionRequest,
	GetGuildTwitchSubscriptionsRequest,
	UpdateTwitchSubscriptionResponse,
	DeleteTwitchSubscriptionResponse,
	GetGuildTwitchSubscriptionsResponse,
	fromOptional
} from '@kbotdev/proto';
import { container } from '@sapphire/framework';
import { Code, ConnectError, HandlerContext } from '@bufbuild/connect';
import type { TwitchSubscription } from '@kbotdev/proto';
import type { PartialMessage } from '@bufbuild/protobuf';
import type { ServiceImpl, ConnectRouter } from '@bufbuild/connect';

export function registerTwitchSubscriptionService(router: ConnectRouter) {
	router.service(TwitchSubscriptionService, new TwitchSubscriptionServiceImpl());
}

class TwitchSubscriptionServiceImpl implements ServiceImpl<typeof TwitchSubscriptionService> {
	@authenticated()
	public async createTwitchSubscription(
		{ guildId, accountId }: CreateTwitchSubscriptionRequest,
		{ auth, error }: HandlerContext
	): Promise<CreateTwitchSubscriptionResponse> {
		const { logger, client, twitch } = container;
		if (error) throw error;
		if (!auth) throw new ConnectError('Unauthenticated', Code.Unauthenticated);

		const guild = client.guilds.cache.get(guildId);
		const member = await guild?.members.fetch(auth.id).catch(() => null);
		if (!guild || !member) throw new ConnectError('Bad request', 400);

		const canManage = await canManageGuild(guild, member);
		if (!canManage) throw new ConnectError('Unauthorized', Code.PermissionDenied);

		try {
			const subscription = await twitch.subscriptions.create({
				guildId,
				accountId
			});

			const data: PartialMessage<CreateTwitchSubscriptionResponse> = {
				subscription: {
					accountId: subscription.account.id,
					accountName: subscription.account.name,
					accountImage: subscription.account.image,
					message: subscription.message ?? undefined,
					role: subscription.roleId ?? undefined,
					discordChannel: subscription.discordChannelId ?? undefined
				}
			};

			return new CreateTwitchSubscriptionResponse(data);
		} catch (err: unknown) {
			logger.error(err);
			throw new ConnectError('Internal server error', Code.Internal);
		}
	}

	@authenticated()
	public async updateTwitchSubscription(
		{ guildId, accountId, message, role, discordChannel }: UpdateTwitchSubscriptionRequest,
		{ auth, error }: HandlerContext
	): Promise<UpdateTwitchSubscriptionResponse> {
		const { logger, client, twitch } = container;
		if (error) throw error;
		if (!auth) throw new ConnectError('Unauthenticated', Code.Unauthenticated);

		const guild = client.guilds.cache.get(guildId);
		const member = await guild?.members.fetch(auth.id).catch(() => null);
		if (!guild || !member) throw new ConnectError('Bad request', 400);

		const canManage = await canManageGuild(guild, member);
		if (!canManage) throw new ConnectError('Unauthorized', Code.PermissionDenied);

		try {
			const subscription = await twitch.subscriptions.update(
				{ guildId, accountId },
				{
					message: fromOptional(message),
					role: fromOptional(role),
					discordChannel: fromOptional(discordChannel)
				}
			);

			const data: PartialMessage<UpdateTwitchSubscriptionResponse> = {
				subscription: {
					accountId: subscription.account.id,
					accountName: subscription.account.name,
					accountImage: subscription.account.image,
					message: subscription.message ?? undefined,
					role: subscription.roleId ?? undefined,
					discordChannel: subscription.discordChannelId ?? undefined
				}
			};

			return new UpdateTwitchSubscriptionResponse(data);
		} catch (err: unknown) {
			logger.error(err);
			throw new ConnectError('Internal server error', Code.Internal);
		}
	}

	@authenticated()
	public async deleteTwitchSubscription(
		{ guildId, accountId }: DeleteTwitchSubscriptionRequest,
		{ auth, error }: HandlerContext
	): Promise<DeleteTwitchSubscriptionResponse> {
		const { logger, client, twitch } = container;
		if (error) throw error;
		if (!auth) throw new ConnectError('Unauthenticated', Code.Unauthenticated);

		const guild = client.guilds.cache.get(guildId);
		const member = await guild?.members.fetch(auth.id).catch(() => null);
		if (!guild || !member) throw new ConnectError('Bad request', 400);

		const canManage = await canManageGuild(guild, member);
		if (!canManage) throw new ConnectError('Unauthorized', Code.PermissionDenied);

		try {
			const subscription = await twitch.subscriptions.delete({ guildId, accountId });

			const data: PartialMessage<DeleteTwitchSubscriptionResponse> = {
				subscription: subscription
					? {
							accountId: subscription.account.id,
							accountName: subscription.account.name,
							accountImage: subscription.account.image,
							message: subscription.message ?? undefined,
							role: subscription.roleId ?? undefined,
							discordChannel: subscription.discordChannelId ?? undefined
					  }
					: undefined
			};

			return new DeleteTwitchSubscriptionResponse(data);
		} catch (err: unknown) {
			logger.error(err);
			throw new ConnectError('Internal server error', Code.Internal);
		}
	}

	@authenticated()
	public async getGuildTwitchSubscriptions(
		{ guildId }: GetGuildTwitchSubscriptionsRequest,
		{ auth, error }: HandlerContext
	): Promise<GetGuildTwitchSubscriptionsResponse> {
		const { logger, client, twitch } = container;
		if (error) throw error;
		if (!auth) throw new ConnectError('Unauthenticated', Code.Unauthenticated);

		const guild = client.guilds.cache.get(guildId);
		const member = await guild?.members.fetch(auth.id).catch(() => null);
		if (!guild || !member) throw new ConnectError('Bad request', 400);

		const canManage = await canManageGuild(guild, member);
		if (!canManage) throw new ConnectError('Unauthorized', Code.PermissionDenied);

		try {
			const subscriptions = await twitch.subscriptions.getByGuild({ guildId });

			const data: Partial<TwitchSubscription>[] = subscriptions.map((subscription) => {
				return {
					channelId: subscription.account.id,
					channelName: subscription.account.name,
					channelImage: subscription.account.image,
					message: subscription.message ?? undefined,
					role: subscription.roleId ?? undefined,
					discordChannel: subscription.discordChannelId ?? undefined
				};
			});

			return new GetGuildTwitchSubscriptionsResponse({ subscriptions: data });
		} catch (err: unknown) {
			logger.error(err);
			throw new ConnectError('Internal server error', Code.Internal);
		}
	}
}
