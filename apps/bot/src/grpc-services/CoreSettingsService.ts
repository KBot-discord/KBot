import { authenticated, catchServerError } from '#grpc/middlewares';
import { assertManagePermissions } from '#grpc/utils';
import { gRPCService } from '#plugins/grpc';
import { CoreSettingsService, FeatureFlags, GetGuildFeatureFlagsRequest, GetGuildFeatureFlagsResponse } from '@kbotdev/proto';
import { container } from '@sapphire/framework';
import * as connect from '@bufbuild/connect';
import type { ConnectRouter, ServiceImpl } from '@bufbuild/connect';
import type { PartialMessage } from '@bufbuild/protobuf';

export class CoreSettingsServiceImpl extends gRPCService implements ServiceImpl<typeof CoreSettingsService> {
	public register(router: ConnectRouter): void {
		router.service(CoreSettingsService, this);
	}

	@authenticated()
	@catchServerError()
	public async getGuildFeatureFlags(
		{ guildId }: GetGuildFeatureFlagsRequest,
		{ auth }: connect.HandlerContext
	): Promise<GetGuildFeatureFlagsResponse> {
		const { core } = container;

		return assertManagePermissions(guildId, auth, async ({ guild }) => {
			const settings = await core.settings.get(guild.id);
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
		});
	}
}
