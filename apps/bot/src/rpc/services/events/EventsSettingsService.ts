import { authenticated } from '#rpc/middlewares';
import { canManageGuild } from '#utils/Discord';
import {
	GetEventSettingsResponse,
	UpdateEventSettingsResponse,
	EventSettingsService,
	GetEventSettingsRequest,
	UpdateEventSettingsRequest,
	fromRequired
} from '@kbotdev/proto';
import { container } from '@sapphire/framework';
import { Code, ConnectError, HandlerContext } from '@bufbuild/connect';
import type { ConnectRouter, ServiceImpl } from '@bufbuild/connect';
import type { PartialMessage } from '@bufbuild/protobuf';

export function registerEventSettingsService(router: ConnectRouter) {
	router.service(EventSettingsService, new EventSettingsServiceImpl());
}

class EventSettingsServiceImpl implements ServiceImpl<typeof EventSettingsService> {
	@authenticated()
	public async getEventSettings({ guildId }: GetEventSettingsRequest, { auth, error }: HandlerContext): Promise<GetEventSettingsResponse> {
		const { logger, client, events } = container;
		if (error) throw error;
		if (!auth) throw new ConnectError('Unauthenticated', Code.Unauthenticated);

		const guild = client.guilds.cache.get(guildId);
		const member = await guild?.members.fetch(auth.id).catch(() => null);
		if (!guild || !member) throw new ConnectError('Bad request', Code.Aborted);

		const canManage = await canManageGuild(guild, member);
		if (!canManage) throw new ConnectError('Unauthorized', Code.PermissionDenied);

		try {
			const settings = await events.getSettings(guildId);

			const data: PartialMessage<GetEventSettingsResponse> = { settings: settings ?? undefined };

			return new GetEventSettingsResponse(data);
		} catch (err: unknown) {
			logger.error(err);
			throw new ConnectError('Internal server error', Code.Internal);
		}
	}

	@authenticated()
	public async updateEventSettings(
		{ guildId, enabled }: UpdateEventSettingsRequest,
		{ auth, error }: HandlerContext
	): Promise<UpdateEventSettingsResponse> {
		const { logger, client, events } = container;
		if (error) throw error;
		if (!auth) throw new ConnectError('Unauthenticated', Code.Unauthenticated);

		const guild = client.guilds.cache.get(guildId);
		const member = await guild?.members.fetch(auth.id).catch(() => null);
		if (!guild || !member) throw new ConnectError('Bad request', Code.Aborted);

		const canManage = await canManageGuild(guild, member);
		if (!canManage) throw new ConnectError('Unauthorized', Code.PermissionDenied);

		try {
			const enabledValue = fromRequired(enabled);

			const settings = await events.upsertSettings(guildId, {
				enabled: enabledValue
			});

			const data: PartialMessage<UpdateEventSettingsResponse> = { settings };

			return new UpdateEventSettingsResponse(data);
		} catch (err: unknown) {
			logger.error(err);
			throw new ConnectError('Internal server error', Code.Internal);
		}
	}
}
