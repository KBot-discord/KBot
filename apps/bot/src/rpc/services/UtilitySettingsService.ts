import { authenticated, catchServerError } from '#rpc/middlewares';
import { assertManagePermissions } from '#rpc/utils';
import { isNullOrUndefined } from '#utils/functions';
import {
	GetUtilitySettingsResponse,
	UpdateUtilitySettingsResponse,
	UtilitySettingsService,
	GetUtilitySettingsRequest,
	UpdateUtilitySettingsRequest,
	fromRequired,
	fromOptional
} from '@kbotdev/proto';
import { container } from '@sapphire/framework';
import * as connect from '@bufbuild/connect';
import type { ConnectRouter, ServiceImpl } from '@bufbuild/connect';
import type { PartialMessage } from '@bufbuild/protobuf';

export function registerUtilitySettingsService(router: ConnectRouter): void {
	router.service(UtilitySettingsService, new UtilitySettingsServiceImpl());
}

class UtilitySettingsServiceImpl implements ServiceImpl<typeof UtilitySettingsService> {
	@authenticated()
	@catchServerError()
	public async getUtilitySettings({ guildId }: GetUtilitySettingsRequest, { auth }: connect.HandlerContext): Promise<GetUtilitySettingsResponse> {
		const { utility } = container;

		return assertManagePermissions(guildId, auth, async ({ guild }) => {
			const settings = await utility.settings.get(guild.id);
			if (isNullOrUndefined(settings)) {
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
		});
	}

	@authenticated()
	@catchServerError()
	public async updateUtilitySettings(
		{ guildId, enabled, incidentChannelId, creditsChannelId }: UpdateUtilitySettingsRequest,
		{ auth }: connect.HandlerContext
	): Promise<UpdateUtilitySettingsResponse> {
		const { utility } = container;

		return assertManagePermissions(guildId, auth, async ({ guild }) => {
			const settings = await utility.settings.upsert(guild.id, {
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
		});
	}
}
