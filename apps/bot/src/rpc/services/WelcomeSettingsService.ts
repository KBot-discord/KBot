import { authenticated } from '#rpc/middlewares';
import { canManageGuild } from '#utils/Discord';
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
import { isNullish } from '@sapphire/utilities';
import { Code, ConnectError, type HandlerContext } from '@bufbuild/connect';
import type { PartialMessage } from '@bufbuild/protobuf';
import type { ServiceImpl, ConnectRouter } from '@bufbuild/connect';

export function registerWelcomeSettingsService(router: ConnectRouter) {
	router.service(WelcomeSettingsService, new WelcomeSettingsServiceImpl());
}

class WelcomeSettingsServiceImpl implements ServiceImpl<typeof WelcomeSettingsService> {
	@authenticated()
	public async getWelcomeSettings({ guildId }: GetWelcomeSettingsRequest, { auth, error }: HandlerContext): Promise<GetWelcomeSettingsResponse> {
		const { logger, client, welcome } = container;
		if (error) throw error;
		if (!auth) throw new ConnectError('Unauthenticated', Code.Unauthenticated);

		const guild = client.guilds.cache.get(guildId);
		const member = await guild?.members.fetch(auth.id).catch(() => null);
		if (!guild || !member) throw new ConnectError('Bad request', Code.Aborted);

		const canManage = await canManageGuild(guild, member);
		if (!canManage) throw new ConnectError('Unauthorized', Code.PermissionDenied);

		try {
			const settings = await welcome.getSettings(guildId);
			if (isNullish(settings)) {
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
		} catch (err: unknown) {
			logger.error(err);
			throw new ConnectError('Internal server error', Code.Internal);
		}
	}

	@authenticated()
	public async updateWelcomeSettings(
		{ guildId, enabled, channelId, message, title, description, image, color }: UpdateWelcomeSettingsRequest,
		{ auth, error }: HandlerContext
	): Promise<UpdateWelcomeSettingsResponse> {
		const { logger, client, welcome } = container;
		if (error) throw error;
		if (!auth) throw new ConnectError('Unauthenticated', Code.Unauthenticated);

		const guild = client.guilds.cache.get(guildId);
		const member = await guild?.members.fetch(auth.id).catch(() => null);
		if (!guild || !member) throw new ConnectError('Bad request', Code.Aborted);

		const canManage = await canManageGuild(guild, member);
		if (!canManage) throw new ConnectError('Unauthorized', Code.PermissionDenied);

		try {
			const settings = await welcome.upsertSettings(guildId, {
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
		} catch (err: unknown) {
			logger.error(err);
			throw new ConnectError('Internal server error', Code.Internal);
		}
	}
}
