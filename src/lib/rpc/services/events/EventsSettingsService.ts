import { EventSettingsService, GetEventSettingsResponse, UpdateEventSettingsResponse } from '#rpc/bot';
import { fromRequired } from '#lib/rpc/utils';
import { createHandler } from '@bufbuild/connect-node';
import { container } from '@sapphire/framework';
import type { Handler } from '@bufbuild/connect-node';
import type { PartialMessage } from '@bufbuild/protobuf';

export function getEventSettingsHandlers(): Handler[] {
	return [getEventSettingsHandler, updateEventSettingsHandler];
}

export const getEventSettingsHandler = createHandler(
	EventSettingsService,
	EventSettingsService.methods.getEventSettings,
	async ({ guildId }): Promise<GetEventSettingsResponse> => {
		try {
			const settings = await container.events.getSettings(guildId);

			const data: PartialMessage<GetEventSettingsResponse> = { config: settings ?? undefined };

			return new GetEventSettingsResponse(data);
		} catch (err: unknown) {
			container.logger.error(err);
			return new GetEventSettingsResponse();
		}
	}
);

export const updateEventSettingsHandler = createHandler(
	EventSettingsService,
	EventSettingsService.methods.updateEventSettings,
	async ({ guildId, enabled }): Promise<UpdateEventSettingsResponse> => {
		try {
			const enabledValue = fromRequired(enabled);

			const settings = await container.events.upsertSettings(guildId, {
				enabled: enabledValue
			});

			const data: PartialMessage<UpdateEventSettingsResponse> = { config: settings };

			return new UpdateEventSettingsResponse(data);
		} catch (err: unknown) {
			container.logger.error(err);
			return new UpdateEventSettingsResponse();
		}
	}
);
