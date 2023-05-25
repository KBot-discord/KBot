import { authenticated, catchServerError } from '#rpc/middlewares';
import { assertManagePermissions } from '#rpc/utils';
import { isNullOrUndefined } from '#utils/functions';
import {
	GetWelcomeSettingsResponse,
	UpdateWelcomeSettingsResponse,
	WelcomeSettingsService,
	GetWelcomeSettingsRequest,
	UpdateWelcomeSettingsRequest,
	fromRequired,
	fromOptional
} from '@kbotdev/proto';
import { container } from '@sapphire/framework';
import * as connect from '@bufbuild/connect';
import type { ServiceImpl, ConnectRouter } from '@bufbuild/connect';
import type { PartialMessage } from '@bufbuild/protobuf';

export function registerWelcomeSettingsService(router: ConnectRouter): void {
	router.service(WelcomeSettingsService, new WelcomeSettingsServiceImpl());
}

class WelcomeSettingsServiceImpl implements ServiceImpl<typeof WelcomeSettingsService> {
	@authenticated()
	@catchServerError()
	public async getWelcomeSettings({ guildId }: GetWelcomeSettingsRequest, { auth }: connect.HandlerContext): Promise<GetWelcomeSettingsResponse> {
		const { welcome } = container;

		return assertManagePermissions(guildId, auth, async ({ guild }) => {
			const settings = await welcome.settings.get(guild.id);
			if (isNullOrUndefined(settings)) {
				return new GetWelcomeSettingsResponse({ settings: undefined });
			}

			const data: PartialMessage<GetWelcomeSettingsResponse> = {
				settings: {
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
		});
	}

	@authenticated()
	@catchServerError()
	public async updateWelcomeSettings(
		{ guildId, enabled, channelId, message, title, description, image, color }: UpdateWelcomeSettingsRequest,
		{ auth }: connect.HandlerContext
	): Promise<UpdateWelcomeSettingsResponse> {
		const { welcome } = container;

		return assertManagePermissions(guildId, auth, async ({ guild }) => {
			const settings = await welcome.settings.upsert(guild.id, {
				enabled: fromRequired(enabled),
				channelId: fromOptional(channelId),
				message: fromOptional(message),
				title: fromOptional(title),
				description: fromOptional(description),
				image: fromOptional(image),
				color: fromOptional(color)
			});

			const data: PartialMessage<UpdateWelcomeSettingsResponse> = {
				settings: {
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
		});
	}
}
