import { fromOptional, fromRequired } from '#lib/rpc/utils';
import { UtilitySettingsService, GetUtilitySettingsResponse, UpdateUtilitySettingsResponse } from '#rpc/bot';
import { createHandler } from '@bufbuild/connect-node';
import { container } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import type { Handler } from '@bufbuild/connect-node';
import type { PartialMessage } from '@bufbuild/protobuf';

export function getUtilitySettingsHandlers(): Handler[] {
	return [getUtilityConfigHandler, updateUtilityConfigHandler];
}

export const getUtilityConfigHandler = createHandler(
	UtilitySettingsService,
	UtilitySettingsService.methods.getUtilitySettings,
	async ({ guildId }): Promise<GetUtilitySettingsResponse> => {
		try {
			const settings = await container.utility.getSettings(guildId);
			if (isNullish(settings)) {
				return new GetUtilitySettingsResponse({ config: undefined });
			}

			const data: PartialMessage<GetUtilitySettingsResponse> = {
				config: {
					enabled: settings.enabled,
					incidentChannelId: settings.incidentChannelId ?? undefined,
					creditsChannelId: settings.creditsChannelId ?? undefined
				}
			};

			return new GetUtilitySettingsResponse(data);
		} catch (err: unknown) {
			container.logger.error(err);
			return new GetUtilitySettingsResponse();
		}
	}
);

export const updateUtilityConfigHandler = createHandler(
	UtilitySettingsService,
	UtilitySettingsService.methods.updateUtilitySettings,
	async ({ guildId, enabled, incidentChannelId, creditsChannelId }): Promise<UpdateUtilitySettingsResponse> => {
		try {
			const settings = await container.utility.upsertSettings(guildId, {
				enabled: fromRequired(enabled),
				incidentChannelId: fromOptional(incidentChannelId),
				creditsChannelId: fromOptional(creditsChannelId)
			});

			const data: PartialMessage<UpdateUtilitySettingsResponse> = {
				config: {
					enabled: settings.enabled,
					incidentChannelId: settings.incidentChannelId ?? undefined,
					creditsChannelId: settings.creditsChannelId ?? undefined
				}
			};

			return new UpdateUtilitySettingsResponse(data);
		} catch (err: unknown) {
			container.logger.error(err);
			return new UpdateUtilitySettingsResponse();
		}
	}
);
