import { authenticated, catchServerError } from '#grpc/middlewares';
import { assertManagePermissions } from '#grpc/utils';
import { isNullOrUndefined } from '#utils/functions';
import { gRPCService } from '#plugins/grpc';
import {
	GetModerationSettingsRequest,
	GetModerationSettingsResponse,
	ModerationSettingsService,
	UpdateModerationSettingsRequest,
	UpdateModerationSettingsResponse,
	fromOptional,
	fromRequired
} from '@kbotdev/proto';
import { container } from '@sapphire/framework';
import * as connect from '@bufbuild/connect';
import type { ConnectRouter, ServiceImpl } from '@bufbuild/connect';
import type { PartialMessage } from '@bufbuild/protobuf';

@catchServerError()
export class ModerationSettingsServiceImpl extends gRPCService implements ServiceImpl<typeof ModerationSettingsService> {
	public register(router: ConnectRouter): void {
		router.service(ModerationSettingsService, this);
	}

	@authenticated()
	public async getModerationSettings(
		{ guildId }: GetModerationSettingsRequest,
		{ auth }: connect.HandlerContext
	): Promise<GetModerationSettingsResponse> {
		const { moderation } = container;

		return assertManagePermissions(guildId, auth, async ({ guild }) => {
			const settings = await moderation.settings.get(guild.id);
			if (isNullOrUndefined(settings)) {
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
