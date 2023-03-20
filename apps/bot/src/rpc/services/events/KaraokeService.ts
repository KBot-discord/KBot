import { authenticated } from '#rpc/middlewares';
import { canManageGuild } from '#utils/Discord';
import {
	KaraokeEventService,
	DeleteKaraokeScheduledEventRequest,
	GetKaraokeScheduledEventsRequest,
	UpdateKaraokeScheduledEventRequest,
	DeleteKaraokeScheduledEventResponse,
	UpdateKaraokeScheduledEventResponse,
	GetKaraokeScheduledEventsResponse,
	fromOptional,
	fromRequired
} from '@kbotdev/proto';
import { container } from '@sapphire/framework';
import { Code, ConnectError, HandlerContext } from '@bufbuild/connect';
import type { KaraokeScheduledEvent } from '@kbotdev/proto';
import type { ConnectRouter, ServiceImpl } from '@bufbuild/connect';

export function registerKaraokeService(router: ConnectRouter) {
	router.service(KaraokeEventService, new KaraokeServiceImpl());
}

class KaraokeServiceImpl implements ServiceImpl<typeof KaraokeEventService> {
	@authenticated()
	public async getKaraokeScheduledEvents(
		{ guildId }: GetKaraokeScheduledEventsRequest,
		{ auth, error }: HandlerContext
	): Promise<GetKaraokeScheduledEventsResponse> {
		const { logger, client, events } = container;
		if (error) throw error;
		if (!auth) throw new ConnectError('Unauthenticated', Code.Unauthenticated);

		const guild = client.guilds.cache.get(guildId);
		const member = await guild?.members.fetch(auth.id).catch(() => null);
		if (!guild || !member) throw new ConnectError('Bad request', Code.Aborted);

		const canManage = await canManageGuild(guild, member);
		if (!canManage) throw new ConnectError('Unauthorized', Code.PermissionDenied);

		try {
			const result = await events.karaoke.getEventByGuild({
				guildId
			});

			const data: Partial<KaraokeScheduledEvent>[] = result //
				.filter((entry) => entry.discordEventId)
				.map(({ id, textChannelId, discordEventId, roleId }) => {
					return { voiceChanneId: id, textChannelId, discordEventId: discordEventId!, roleId: roleId ?? undefined };
				});

			return new GetKaraokeScheduledEventsResponse({ events: data });
		} catch (err: unknown) {
			logger.error(err);
			throw new ConnectError('Internal server error', Code.Internal);
		}
	}

	@authenticated()
	public async updateKaraokeScheduledEvent(
		{ guildId, voiceChannelId, textChannelId, discordEventId, roleId }: UpdateKaraokeScheduledEventRequest,
		{ auth, error }: HandlerContext
	): Promise<UpdateKaraokeScheduledEventResponse> {
		const { logger, client, events } = container;
		if (error) throw error;
		if (!auth) throw new ConnectError('Unauthenticated', Code.Unauthenticated);

		const guild = client.guilds.cache.get(guildId);
		const member = await guild?.members.fetch(auth.id).catch(() => null);
		if (!guild || !member) throw new ConnectError('Bad request', Code.Aborted);

		const canManage = await canManageGuild(guild, member);
		if (!canManage) throw new ConnectError('Unauthorized', Code.PermissionDenied);

		try {
			const result = await events.karaoke.updateEvent({
				id: voiceChannelId,
				textChannelId: fromRequired(textChannelId),
				discordEventId: fromRequired(discordEventId),
				roleId: fromOptional(roleId)
			});

			const data: Partial<KaraokeScheduledEvent> = {
				voiceChannelId: result.id,
				textChannelId: result.textChannelId,
				discordEventId: result.discordEventId ?? undefined,
				roleId: result.roleId ?? undefined
			};

			return new UpdateKaraokeScheduledEventResponse({ event: data });
		} catch (err: unknown) {
			logger.error(err);
			throw new ConnectError('Internal server error', Code.Internal);
		}
	}

	@authenticated()
	public async deleteKaraokeScheduledEvent(
		{ guildId, voiceChannelId }: DeleteKaraokeScheduledEventRequest,
		{ auth, error }: HandlerContext
	): Promise<DeleteKaraokeScheduledEventResponse> {
		const { logger, client, events } = container;
		if (error) throw error;
		if (!auth) throw new ConnectError('Unauthenticated', Code.Unauthenticated);

		const guild = client.guilds.cache.get(guildId);
		const member = await guild?.members.fetch(auth.id).catch(() => null);
		if (!guild || !member) throw new ConnectError('Bad request', Code.Aborted);

		const canManage = await canManageGuild(guild, member);
		if (!canManage) throw new ConnectError('Unauthorized', Code.PermissionDenied);

		try {
			const result = await events.karaoke.deleteScheduledEvent({
				guildId,
				eventId: voiceChannelId
			});

			const data: Partial<KaraokeScheduledEvent> = {
				voiceChannelId: result?.id,
				textChannelId: result?.textChannelId,
				discordEventId: result?.discordEventId ?? undefined,
				roleId: result?.roleId ?? undefined
			};

			return new DeleteKaraokeScheduledEventResponse({ event: data });
		} catch (err: unknown) {
			logger.error(err);
			throw new ConnectError('Internal server error', Code.Internal);
		}
	}
}
