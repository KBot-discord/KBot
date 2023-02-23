import { ModerationSettingsService, GetModerationSettingsResponse, UpdateModerationSettingsResponse } from '#rpc/bot';
import { fromOptional, fromRequired } from '#lib/rpc/utils';
import { createHandler } from '@bufbuild/connect-node';
import { container } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import type { Handler } from '@bufbuild/connect-node';
import type { PartialMessage } from '@bufbuild/protobuf';

export function getModerationSettingsHandlers(): Handler[] {
	return [getModerationSettingsHandler, updateModerationSettingsHandler];
}

export const getModerationSettingsHandler = createHandler(
	ModerationSettingsService,
	ModerationSettingsService.methods.getModerationSettings,
	async ({ guildId }): Promise<GetModerationSettingsResponse> => {
		try {
			const settings = await container.moderation.getSettings(guildId);
			if (isNullish(settings)) {
				return new GetModerationSettingsResponse({ config: undefined });
			}

			const data: PartialMessage<GetModerationSettingsResponse> = {
				config: {
					enabled: settings.enabled,
					logChannelId: settings.logChannelId ?? undefined,
					reportChannelId: settings.reportChannelId ?? undefined,
					muteRoleId: settings.muteRoleId ?? undefined,
					minageReq: settings.minAccountAgeReq ?? undefined,
					minageMessage: settings.minAccountAgeMsg ?? undefined,
					antihoistEnabled: settings.antiHoistEnabled
				}
			};

			return new GetModerationSettingsResponse(data);
		} catch (err: unknown) {
			container.logger.error(err);
			return new GetModerationSettingsResponse();
		}
	}
);

export const updateModerationSettingsHandler = createHandler(
	ModerationSettingsService,
	ModerationSettingsService.methods.updateModerationSettings,
	async ({
		guildId,
		enabled,
		logChannelId,
		reportChannelId,
		muteRoleId,
		minageReq,
		minageMessage,
		antihoistEnabled
	}): Promise<UpdateModerationSettingsResponse> => {
		try {
			const settings = await container.moderation.upsertSettings(guildId, {
				enabled: fromRequired(enabled),
				logChannelId: fromOptional(logChannelId),
				reportChannelId: fromOptional(reportChannelId),
				muteRoleId: fromOptional(muteRoleId),
				minAccountAgeReq: fromOptional(minageReq),
				minAccountAgeMsg: fromOptional(minageMessage),
				antiHoistEnabled: fromRequired(antihoistEnabled)
			});

			const data: PartialMessage<GetModerationSettingsResponse> = {
				config: {
					enabled: settings.enabled,
					logChannelId: settings.logChannelId ?? undefined,
					reportChannelId: settings.reportChannelId ?? undefined,
					muteRoleId: settings.muteRoleId ?? undefined,
					minageReq: settings.minAccountAgeReq ?? undefined,
					minageMessage: settings.minAccountAgeMsg ?? undefined,
					antihoistEnabled: settings.antiHoistEnabled
				}
			};

			return new UpdateModerationSettingsResponse(data);
		} catch (err: unknown) {
			container.logger.error(err);
			return new UpdateModerationSettingsResponse();
		}
	}
);
