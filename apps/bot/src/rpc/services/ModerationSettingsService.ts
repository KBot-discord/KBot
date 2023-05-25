import { authenticated, catchServerError } from '#rpc/middlewares';
import { assertManagePermissions } from '#rpc/utils';
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
import * as connect from '@bufbuild/connect';
import type { ConnectRouter, ServiceImpl } from '@bufbuild/connect';
import type { PartialMessage } from '@bufbuild/protobuf';

export function registerModerationSettingsService(router: ConnectRouter): void {
	router.service(ModerationSettingsService, new ModerationSettingsServiceImpl());
}

class ModerationSettingsServiceImpl implements ServiceImpl<typeof ModerationSettingsService> {
	@authenticated()
	@catchServerError()
	public async getModerationSettings(
		{ guildId }: GetModerationSettingsRequest,
		{ auth }: connect.HandlerContext
	): Promise<GetModerationSettingsResponse> {
		const { moderation } = container;

		return assertManagePermissions(guildId, auth, async ({ guild }) => {
			const settings = await moderation.settings.get(guild.id);
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
		});
	}

	@authenticated()
	@catchServerError()
	public async updateModerationSettings(
		{ guildId, enabled, reportChannelId, minageReq, minageMessage, antihoistEnabled }: UpdateModerationSettingsRequest,
		{ auth }: connect.HandlerContext
	): Promise<UpdateModerationSettingsResponse> {
		const { moderation } = container;

		return assertManagePermissions(guildId, auth, async ({ guild }) => {
			const settings = await moderation.settings.upsert(guild.id, {
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
		});
	}
}
