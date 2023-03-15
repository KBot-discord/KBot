import { authenticated } from '#rpc/middlewares';
import { canManageGuild } from '#utils/Discord';
import {
	TwitchSettingsService,
	GetTwitchSettingsRequest,
	GetTwitchSettingsResponse,
	UpdateTwitchSettingsRequest,
	UpdateTwitchSettingsResponse
} from '@kbotdev/proto';
import { container } from '@sapphire/framework';
import { Code, ConnectError, HandlerContext } from '@bufbuild/connect';
import type { PartialMessage } from '@bufbuild/protobuf';
import type { ServiceImpl, ConnectRouter } from '@bufbuild/connect';

export function registerTwitchSettingsService(router: ConnectRouter) {
	router.service(TwitchSettingsService, new TwitchSettingsServiceImpl());
}

class TwitchSettingsServiceImpl implements ServiceImpl<typeof TwitchSettingsService> {
	@authenticated()
	public async getTwitchSettings({ guildId }: GetTwitchSettingsRequest, { auth, error }: HandlerContext): Promise<GetTwitchSettingsResponse> {
		const { logger, client, twitch } = container;
		if (error) throw error;
		if (!auth) throw new ConnectError('Unauthenticated', Code.Unauthenticated);

		const guild = client.guilds.cache.get(guildId);
		const member = await guild?.members.fetch(auth.id).catch(() => null);
		if (!guild || !member) throw new ConnectError('Bad request', 400);

		const canManage = await canManageGuild(guild, member);
		if (!canManage) throw new ConnectError('Unauthorized', Code.PermissionDenied);

		try {
			const settings = await twitch.settings.get({
				guildId
			});

			const data: PartialMessage<GetTwitchSettingsResponse> = {
				settings: settings ? { enabled: settings.enabled } : undefined
			};

			return new GetTwitchSettingsResponse(data);
		} catch (err: unknown) {
			logger.error(err);
			throw new ConnectError('Internal server error', Code.Internal);
		}
	}

	@authenticated()
	public async updateTwitchSettings(
		{ guildId, enabled }: UpdateTwitchSettingsRequest,
		{ auth, error }: HandlerContext
	): Promise<UpdateTwitchSettingsResponse> {
		const { logger, client, twitch } = container;
		if (error) throw error;
		if (!auth) throw new ConnectError('Unauthenticated', Code.Unauthenticated);

		const guild = client.guilds.cache.get(guildId);
		const member = await guild?.members.fetch(auth.id).catch(() => null);
		if (!guild || !member) throw new ConnectError('Bad request', 400);

		const canManage = await canManageGuild(guild, member);
		if (!canManage) throw new ConnectError('Unauthorized', Code.PermissionDenied);

		try {
			const settings = await twitch.settings.upsert(
				{ guildId }, //
				{ enabled }
			);

			const data: PartialMessage<UpdateTwitchSettingsResponse> = {
				settings: settings ? { enabled: settings.enabled } : undefined
			};

			return new UpdateTwitchSettingsResponse(data);
		} catch (err: unknown) {
			logger.error(err);
			throw new ConnectError('Internal server error', Code.Internal);
		}
	}
}
