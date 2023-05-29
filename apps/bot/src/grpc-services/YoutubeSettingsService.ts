import { authenticated, catchServerError } from '#grpc/middlewares';
import { assertManagePermissions } from '#grpc/utils';
import { gRPCService } from '#plugins/grpc';
import {
	GetYoutubeSettingsRequest,
	GetYoutubeSettingsResponse,
	UpdateYoutubeSettingsRequest,
	UpdateYoutubeSettingsResponse,
	YoutubeSettingsService
} from '@kbotdev/proto';
import { container } from '@sapphire/framework';
import * as connect from '@bufbuild/connect';
import type { PartialMessage } from '@bufbuild/protobuf';
import type { ConnectRouter, ServiceImpl } from '@bufbuild/connect';

export class YoutubeSettingsServiceImpl extends gRPCService implements ServiceImpl<typeof YoutubeSettingsService> {
	public register(router: ConnectRouter): void {
		router.service(YoutubeSettingsService, this);
	}

	@authenticated()
	@catchServerError()
	public async getYoutubeSettings({ guildId }: GetYoutubeSettingsRequest, { auth }: connect.HandlerContext): Promise<GetYoutubeSettingsResponse> {
		const { youtube } = container;

		return assertManagePermissions(guildId, auth, async ({ guild }) => {
			const settings = await youtube.settings.get(guild.id);

			const data: PartialMessage<GetYoutubeSettingsResponse> = {
				settings: settings ? { enabled: settings.enabled } : undefined
			};

			return new GetYoutubeSettingsResponse(data);
		});
	}

	@authenticated()
	@catchServerError()
	public async updateYoutubeSettings(
		{ guildId, enabled }: UpdateYoutubeSettingsRequest,
		{ auth }: connect.HandlerContext
	): Promise<UpdateYoutubeSettingsResponse> {
		const { youtube } = container;

		return assertManagePermissions(guildId, auth, async ({ guild }) => {
			const settings = await youtube.settings.upsert(guild.id, { enabled });

			const data: PartialMessage<UpdateYoutubeSettingsResponse> = {
				settings: settings ? { enabled: settings.enabled } : undefined
			};

			return new UpdateYoutubeSettingsResponse(data);
		});
	}
}
