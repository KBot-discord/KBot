import { authenticated } from '#rpc/middlewares';
import { canManageGuild } from '#utils/Discord';
import {
	GetModerationSettingsResponse,
	UpdateModerationSettingsResponse,
	ModerationSettingsService,
	UpdateModerationSettingsRequest,
	GetModerationSettingsRequest,
	fromRequired,
	fromOptional
} from '@kbotdev/proto';
import { container } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import { Code, ConnectError, type HandlerContext } from '@bufbuild/connect';
import type { ConnectRouter, ServiceImpl } from '@bufbuild/connect';
import type { PartialMessage } from '@bufbuild/protobuf';

export function registerModerationSettingsService(router: ConnectRouter) {
	router.service(ModerationSettingsService, new ModerationSettingsServiceImpl());
}

class ModerationSettingsServiceImpl implements ServiceImpl<typeof ModerationSettingsService> {
	@authenticated()
	public async getModerationSettings(
		{ guildId }: GetModerationSettingsRequest,
		{ auth, error }: HandlerContext
	): Promise<GetModerationSettingsResponse> {
		const { logger, client, moderation } = container;
		if (error) throw error;
		if (!auth) throw new ConnectError('Unauthenticated', Code.Unauthenticated);

		const guild = client.guilds.cache.get(guildId);
		const member = await guild?.members.fetch(auth.id).catch(() => null);
		if (!guild || !member) throw new ConnectError('Bad request', Code.Aborted);

		const canManage = await canManageGuild(guild, member);
		if (!canManage) throw new ConnectError('Unauthorized', Code.PermissionDenied);

		try {
			const settings = await moderation.getSettings(guildId);
			if (isNullish(settings)) {
				return new GetModerationSettingsResponse({ settings: undefined });
			}

			const data: PartialMessage<GetModerationSettingsResponse> = {
				settings: {
					enabled: settings.enabled,
					reportChannelId: settings.reportChannelId ?? undefined,
					minageReq: settings.minAccountAgeReq ?? undefined,
					minageMessage: settings.minAccountAgeMsg ?? undefined,
					antihoistEnabled: settings.antiHoistEnabled
				}
			};

			return new GetModerationSettingsResponse(data);
		} catch (err: unknown) {
			logger.error(err);
			throw new ConnectError('Internal server error', Code.Internal);
		}
	}

	@authenticated()
	public async updateModerationSettings(
		{ guildId, enabled, reportChannelId, minageReq, minageMessage, antihoistEnabled }: UpdateModerationSettingsRequest,
		{ auth, error }: HandlerContext
	): Promise<UpdateModerationSettingsResponse> {
		const { logger, client, moderation } = container;
		if (error) throw error;
		if (!auth) throw new ConnectError('Unauthenticated', Code.Unauthenticated);

		const guild = client.guilds.cache.get(guildId);
		const member = await guild?.members.fetch(auth.id).catch(() => null);
		if (!guild || !member) throw new ConnectError('Bad request', Code.Aborted);

		const canManage = await canManageGuild(guild, member);
		if (!canManage) throw new ConnectError('Unauthorized', Code.PermissionDenied);

		try {
			const settings = await moderation.upsertSettings(guildId, {
				enabled: fromRequired(enabled),
				reportChannelId: fromOptional(reportChannelId),
				minAccountAgeReq: fromOptional(minageReq),
				minAccountAgeMsg: fromOptional(minageMessage),
				antiHoistEnabled: fromRequired(antihoistEnabled)
			});

			const data: PartialMessage<GetModerationSettingsResponse> = {
				settings: {
					enabled: settings.enabled,
					reportChannelId: settings.reportChannelId ?? undefined,
					minageReq: settings.minAccountAgeReq ?? undefined,
					minageMessage: settings.minAccountAgeMsg ?? undefined,
					antihoistEnabled: settings.antiHoistEnabled
				}
			};

			return new UpdateModerationSettingsResponse(data);
		} catch (err: unknown) {
			logger.error(err);
			throw new ConnectError('Internal server error', Code.Internal);
		}
	}
}
