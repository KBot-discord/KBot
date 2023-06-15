import { authenticated, catchServerError } from '#grpc/middlewares';
import { assertManagePermissions } from '#grpc/utils';
import { gRPCService } from '#plugins/grpc';
import {
	DeleteKaraokeScheduledEventRequest,
	DeleteKaraokeScheduledEventResponse,
	GetKaraokeScheduledEventsRequest,
	GetKaraokeScheduledEventsResponse,
	KaraokeEventService,
	UpdateKaraokeScheduledEventRequest,
	UpdateKaraokeScheduledEventResponse,
	fromOptional,
	fromRequired
} from '@kbotdev/proto';
import { container } from '@sapphire/framework';
import * as connect from '@bufbuild/connect';
import type { ConnectRouter, ServiceImpl } from '@bufbuild/connect';
import type { KaraokeScheduledEvent } from '@kbotdev/proto';

@catchServerError()
export class KaraokeServiceImpl extends gRPCService implements ServiceImpl<typeof KaraokeEventService> {
	public register(router: ConnectRouter): void {
		router.service(KaraokeEventService, this);
	}

	@authenticated()
	public async getKaraokeScheduledEvents(
		{ guildId }: GetKaraokeScheduledEventsRequest,
		{ auth }: connect.HandlerContext
	): Promise<GetKaraokeScheduledEventsResponse> {
		const { events } = container;

		return assertManagePermissions(guildId, auth, async ({ guild }) => {
			const result = await events.karaoke.getEventByGuild(guild.id);

			const data: Partial<KaraokeScheduledEvent>[] = result //
				.filter((entry) => entry.discordEventId)
				.map(({ id, textChannelId, discordEventId, roleId }) => {
					return {
						voiceChanneId: id,
						textChannelId,
						discordEventId: discordEventId ?? undefined,
						roleId: roleId ?? undefined
					};
				});

			return new GetKaraokeScheduledEventsResponse({ events: data });
		});
	}

	@authenticated()
	public async updateKaraokeScheduledEvent(
		{ guildId, voiceChannelId, textChannelId, discordEventId, roleId }: UpdateKaraokeScheduledEventRequest,
		{ auth }: connect.HandlerContext
	): Promise<UpdateKaraokeScheduledEventResponse> {
		const { events } = container;

		return assertManagePermissions(guildId, auth, async () => {
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
		});
	}

	@authenticated()
	public async deleteKaraokeScheduledEvent(
		{ guildId, voiceChannelId }: DeleteKaraokeScheduledEventRequest,
		{ auth }: connect.HandlerContext
	): Promise<DeleteKaraokeScheduledEventResponse> {
		const { events } = container;

		return assertManagePermissions(guildId, auth, async () => {
			const result = await events.karaoke.deleteEvent(voiceChannelId);

			const data: Partial<KaraokeScheduledEvent> = {
				voiceChannelId: result?.id,
				textChannelId: result?.textChannelId,
				discordEventId: result?.discordEventId ?? undefined,
				roleId: result?.roleId ?? undefined
			};

			return new DeleteKaraokeScheduledEventResponse({ event: data });
		});
	}
}
