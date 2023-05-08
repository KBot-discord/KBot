import { authenticated } from '#rpc/middlewares';
import { canManageGuild } from '#utils/Discord';
import {
	YoutubeSettingsService,
	GetYoutubeSettingsRequest,
	GetYoutubeSettingsResponse,
	UpdateYoutubeSettingsRequest,
	UpdateYoutubeSettingsResponse
} from '@kbotdev/proto';
import { container } from '@sapphire/framework';
import { Code, ConnectError, type HandlerContext } from '@bufbuild/connect';
import type { PartialMessage } from '@bufbuild/protobuf';
import type { ServiceImpl, ConnectRouter } from '@bufbuild/connect';

export function registerYoutubeSettingsService(router: ConnectRouter) {
	router.service(YoutubeSettingsService, new YoutubeSettingsServiceImpl());
}

class YoutubeSettingsServiceImpl implements ServiceImpl<typeof YoutubeSettingsService> {
	@authenticated()
	public async getYoutubeSettings({ guildId }: GetYoutubeSettingsRequest, { auth, error }: HandlerContext): Promise<GetYoutubeSettingsResponse> {
		const { logger, client, youtube } = container;
		if (error) throw error;
		if (!auth) throw new ConnectError('Unauthenticated', Code.Unauthenticated);

		const guild = client.guilds.cache.get(guildId);
		const member = await guild?.members.fetch(auth.id).catch(() => null);
		if (!guild || !member) throw new ConnectError('Bad request', Code.Aborted);

		const canManage = await canManageGuild(guild, member);
		if (!canManage) throw new ConnectError('Unauthorized', Code.PermissionDenied);

		try {
			const settings = await youtube.settings.get({
				guildId
			});

			const data: PartialMessage<GetYoutubeSettingsResponse> = {
				settings: settings ? { enabled: settings.enabled } : undefined
			};

			return new GetYoutubeSettingsResponse(data);
		} catch (err: unknown) {
			logger.error(err);
			throw new ConnectError('Internal server error', Code.Internal);
		}
	}

	@authenticated()
	public async updateYoutubeSettings(
		{ guildId, enabled }: UpdateYoutubeSettingsRequest,
		{ auth, error }: HandlerContext
	): Promise<UpdateYoutubeSettingsResponse> {
		const { logger, client, youtube } = container;
		if (error) throw error;
		if (!auth) throw new ConnectError('Unauthenticated', Code.Unauthenticated);

		const guild = client.guilds.cache.get(guildId);
		const member = await guild?.members.fetch(auth.id).catch(() => null);
		if (!guild || !member) throw new ConnectError('Bad request', Code.Aborted);

		const canManage = await canManageGuild(guild, member);
		if (!canManage) throw new ConnectError('Unauthorized', Code.PermissionDenied);

		try {
			const settings = await youtube.settings.upsert(
				{ guildId }, //
				{ enabled }
			);

			const data: PartialMessage<UpdateYoutubeSettingsResponse> = {
				settings: settings ? { enabled: settings.enabled } : undefined
			};

			return new UpdateYoutubeSettingsResponse(data);
		} catch (err: unknown) {
			logger.error(err);
			throw new ConnectError('Internal server error', Code.Internal);
		}
	}
}
