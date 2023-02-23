import { NotificationSettingsService, GetNotificationSettingsResponse, UpdateNotificationSettingsResponse } from '#rpc/bot';
import { fromRequired } from '#lib/rpc/utils';
import { createHandler } from '@bufbuild/connect-node';
import { container } from '@sapphire/framework';
import type { Handler } from '@bufbuild/connect-node';
import type { PartialMessage } from '@bufbuild/protobuf';

export function getNotificationSettingsHandlers(): Handler[] {
	return [getNotificationConfigHandler, updateNotificationConfigHandler];
}

export const getNotificationConfigHandler = createHandler(
	NotificationSettingsService,
	NotificationSettingsService.methods.getNotificationSettings,
	async ({ guildId }): Promise<GetNotificationSettingsResponse> => {
		try {
			const settings = await container.notifications.getSettings(guildId);

			const data: PartialMessage<GetNotificationSettingsResponse> = { config: settings ?? undefined };

			return new GetNotificationSettingsResponse(data);
		} catch (err: unknown) {
			container.logger.error(err);
			return new GetNotificationSettingsResponse();
		}
	}
);

export const updateNotificationConfigHandler = createHandler(
	NotificationSettingsService,
	NotificationSettingsService.methods.updateNotificationSettings,
	async ({ guildId, enabled }): Promise<UpdateNotificationSettingsResponse> => {
		try {
			const enabledValue = fromRequired(enabled);

			const settings = await container.notifications.upsertSettings(guildId, {
				enabled: enabledValue
			});

			const data: PartialMessage<UpdateNotificationSettingsResponse> = { config: settings };

			return new UpdateNotificationSettingsResponse(data);
		} catch (err: unknown) {
			container.logger.error(err);
			return new UpdateNotificationSettingsResponse();
		}
	}
);
