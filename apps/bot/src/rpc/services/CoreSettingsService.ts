import { authenticated } from '#rpc/middlewares';
import { canManageGuild } from '#utils/discord';
import { CoreSettingsService, FeatureFlags, GetGuildFeatureFlagsRequest, GetGuildFeatureFlagsResponse } from '@kbotdev/proto';
import { container } from '@sapphire/framework';
import { Code, ConnectError, type HandlerContext } from '@bufbuild/connect';
import type { ConnectRouter, ServiceImpl } from '@bufbuild/connect';
import type { PartialMessage } from '@bufbuild/protobuf';

export function registerCoreSettingsService(router: ConnectRouter): void {
	router.service(CoreSettingsService, new CoreSettingsServiceImpl());
}

class CoreSettingsServiceImpl implements ServiceImpl<typeof CoreSettingsService> {
	@authenticated()
	public async getGuildFeatureFlags(
		{ guildId }: GetGuildFeatureFlagsRequest,
		{ auth, error }: HandlerContext
	): Promise<GetGuildFeatureFlagsResponse> {
		const { logger, client, core } = container;
		if (error) throw error;
		if (!auth) throw new ConnectError('Unauthenticated', Code.Unauthenticated);

		const guild = client.guilds.cache.get(guildId);
		const member = await guild?.members.fetch(auth.id).catch(() => null);
		if (!guild || !member) throw new ConnectError('Bad request', Code.Aborted);

		const canManage = await canManageGuild(guild, member);
		if (!canManage) throw new ConnectError('Unauthorized', Code.PermissionDenied);

		try {
			const settings = await core.settings.get(guildId);
			if (!settings) {
				return new GetGuildFeatureFlagsResponse({ flags: [] });
			}

			const data: PartialMessage<GetGuildFeatureFlagsResponse> = {
				flags: settings.flags.map((flag) => {
					switch (flag) {
						case 'DEV':
							return FeatureFlags.DEV;
						case 'BETA':
							return FeatureFlags.BETA;
						default:
							return FeatureFlags.UNDEFINED;
					}
				})
			};

			return new GetGuildFeatureFlagsResponse(data);
		} catch (err: unknown) {
			logger.error(err);
			throw new ConnectError('Internal server error', Code.Internal);
		}
	}
}
