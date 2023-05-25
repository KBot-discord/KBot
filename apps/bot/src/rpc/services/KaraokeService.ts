import { authenticated, catchServerError } from '#rpc/middlewares';
import { assertManagePermissions } from '#rpc/utils';
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
import * as connect from '@bufbuild/connect';
import type { ConnectRouter, ServiceImpl } from '@bufbuild/connect';
import type { KaraokeScheduledEvent } from '@kbotdev/proto';

export function registerKaraokeService(router: ConnectRouter): void {
	router.service(KaraokeEventService, new KaraokeServiceImpl());
}

class KaraokeServiceImpl implements ServiceImpl<typeof KaraokeEventService> {
	@authenticated()
	@catchServerError()
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
	@catchServerError()
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
	@catchServerError()
	public async deleteKaraokeScheduledEvent(
		{ guildId, voiceChannelId }: DeleteKaraokeScheduledEventRequest,
		{ auth }: connect.HandlerContext
	): Promise<DeleteKaraokeScheduledEventResponse> {
		const { events } = container;

		return assertManagePermissions(guildId, auth, async ({ guild }) => {
			const result = await events.karaoke.deleteScheduledEvent(guild.id, voiceChannelId);

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
