import {
	GetUtilitySettingsResponse,
	UpdateUtilitySettingsResponse,
	UtilitySettingsService,
	GetUtilitySettingsRequest,
	UpdateUtilitySettingsRequest
} from '#rpc/bot';
import { fromOptional, fromRequired } from '#rpc/utils';
import { authenticated } from '#rpc/middlewares';
import { canManageGuild } from '#utils/Discord';
import { container } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import { Code, ConnectError, HandlerContext } from '@bufbuild/connect';
import type { ConnectRouter, ServiceImpl } from '@bufbuild/connect';
import type { PartialMessage } from '@bufbuild/protobuf';

export function registerUtilitySettingsService(router: ConnectRouter) {
	router.service(UtilitySettingsService, new UtilitySettingsServiceImpl());
}

class UtilitySettingsServiceImpl implements ServiceImpl<typeof UtilitySettingsService> {
	@authenticated()
	public async getUtilitySettings({ guildId }: GetUtilitySettingsRequest, { auth, error }: HandlerContext): Promise<GetUtilitySettingsResponse> {
		const { logger, client, utility } = container;
		if (error) throw error;
		if (!auth) throw new ConnectError('Unauthenticated', Code.Unauthenticated);

		const guild = await client.guilds.cache.get(guildId);
		const member = await guild?.members.fetch(auth.id).catch(() => null);
		if (!guild || !member) throw new ConnectError('Bad request', 400);

		const canManage = await canManageGuild(guild, member);
		if (!canManage) throw new ConnectError('Unauthorized', Code.PermissionDenied);

		try {
			const settings = await utility.getSettings(guildId);
			if (isNullish(settings)) {
				return new GetUtilitySettingsResponse({ settings: undefined });
			}

			const data: PartialMessage<GetUtilitySettingsResponse> = {
				settings: {
					enabled: settings.enabled,
					incidentChannelId: settings.incidentChannelId ?? undefined,
					creditsChannelId: settings.creditsChannelId ?? undefined
				}
			};

			return new GetUtilitySettingsResponse(data);
		} catch (err: unknown) {
			logger.error(err);
			throw new ConnectError('Internal server error', Code.Internal);
		}
	}

	@authenticated()
	public async updateUtilitySettings(
		{ guildId, enabled, incidentChannelId, creditsChannelId }: UpdateUtilitySettingsRequest,
		{ auth, error }: HandlerContext
	): Promise<UpdateUtilitySettingsResponse> {
		const { logger, client, utility } = container;
		if (error) throw error;
		if (!auth) throw new ConnectError('Unauthenticated', Code.Unauthenticated);

		const guild = await client.guilds.cache.get(guildId);
		const member = await guild?.members.fetch(auth.id).catch(() => null);
		if (!guild || !member) throw new ConnectError('Bad request', 400);

		const canManage = await canManageGuild(guild, member);
		if (!canManage) throw new ConnectError('Unauthorized', Code.PermissionDenied);

		try {
			const settings = await utility.upsertSettings(guildId, {
				enabled: fromRequired(enabled),
				incidentChannelId: fromOptional(incidentChannelId),
				creditsChannelId: fromOptional(creditsChannelId)
			});

			const data: PartialMessage<UpdateUtilitySettingsResponse> = {
				settings: {
					enabled: settings.enabled,
					incidentChannelId: settings.incidentChannelId ?? undefined,
					creditsChannelId: settings.creditsChannelId ?? undefined
				}
			};

			return new UpdateUtilitySettingsResponse(data);
		} catch (err: unknown) {
			logger.error(err);
			throw new ConnectError('Internal server error', Code.Internal);
		}
	}
}
