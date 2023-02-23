import { CoreSettingsService, GetCoreSettingsResponse, UpdateCoreSettingsResponse } from '#rpc/bot';
import { createHandler } from '@bufbuild/connect-node';
import { container } from '@sapphire/framework';
import type { Handler } from '@bufbuild/connect-node';
import type { PartialMessage } from '@bufbuild/protobuf';

export function getCoreSettingsHandlers(): Handler[] {
	return [getCoreSettingsHandler, updateCoreSettingsHandler];
}

export const getCoreSettingsHandler = createHandler(
	CoreSettingsService,
	CoreSettingsService.methods.getCoreSettings,
	async ({ guildId }): Promise<GetCoreSettingsResponse> => {
		try {
			const settings = await container.core.getSettings(guildId);

			const data: PartialMessage<GetCoreSettingsResponse> = { settings: settings ?? undefined };

			return new GetCoreSettingsResponse(data);
		} catch (err: unknown) {
			container.logger.error(err);
			return new GetCoreSettingsResponse();
		}
	}
);

export const updateCoreSettingsHandler = createHandler(
	CoreSettingsService,
	CoreSettingsService.methods.updateCoreSettings,
	async ({ guildId, staffRoles, botManagers }): Promise<UpdateCoreSettingsResponse> => {
		try {
			const settings = await container.core.upsertSettings(guildId, {
				staffRoles,
				botManagers
			});

			const data: PartialMessage<UpdateCoreSettingsResponse> = { settings };

			return new UpdateCoreSettingsResponse(data);
		} catch (err: unknown) {
			container.logger.error(err);
			return new UpdateCoreSettingsResponse();
		}
	}
);
