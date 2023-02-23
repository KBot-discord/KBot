import { fromOptional, fromRequired } from '#lib/rpc/utils';
import { WelcomeSettingsService, GetWelcomeSettingsResponse, UpdateWelcomeSettingsResponse } from '#rpc/bot';
import { createHandler } from '@bufbuild/connect-node';
import { container } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import type { Handler } from '@bufbuild/connect-node';
import type { PartialMessage } from '@bufbuild/protobuf';

export function getWelcomeSettingsHandlers(): Handler[] {
	return [getWelcomeConfigHandler, updateWelcomeConfigHandler];
}

export const getWelcomeConfigHandler = createHandler(
	WelcomeSettingsService,
	WelcomeSettingsService.methods.getWelcomeSettings,
	async ({ guildId }): Promise<GetWelcomeSettingsResponse> => {
		try {
			const settings = await container.welcome.getSettings(guildId);
			if (isNullish(settings)) {
				return new GetWelcomeSettingsResponse({ config: undefined });
			}

			const data: PartialMessage<GetWelcomeSettingsResponse> = {
				config: {
					enabled: settings.enabled,
					channelId: settings.channelId ?? undefined,
					message: settings.message ?? undefined,
					title: settings.title ?? undefined,
					description: settings.description ?? undefined,
					image: settings.image ?? undefined,
					color: settings.color ?? undefined
				}
			};

			return new GetWelcomeSettingsResponse(data);
		} catch (err: unknown) {
			container.logger.error(err);
			return new GetWelcomeSettingsResponse();
		}
	}
);

export const updateWelcomeConfigHandler = createHandler(
	WelcomeSettingsService,
	WelcomeSettingsService.methods.updateWelcomeSettings,
	async ({ guildId, enabled, channelId, message, title, description, image, color }): Promise<UpdateWelcomeSettingsResponse> => {
		try {
			const settings = await container.welcome.upsertSettings(guildId, {
				enabled: fromRequired(enabled),
				channelId: fromOptional(channelId),
				message: fromOptional(message),
				title: fromOptional(title),
				description: fromOptional(description),
				image: fromOptional(image),
				color: fromOptional(color)
			});

			const data: PartialMessage<UpdateWelcomeSettingsResponse> = {
				config: {
					enabled: settings.enabled,
					channelId: settings.channelId ?? undefined,
					message: settings.message ?? undefined,
					title: settings.title ?? undefined,
					description: settings.description ?? undefined,
					image: settings.image ?? undefined,
					color: settings.color ?? undefined
				}
			};

			return new UpdateWelcomeSettingsResponse(data);
		} catch (err: unknown) {
			container.logger.error(err);
			return new UpdateWelcomeSettingsResponse();
		}
	}
);
