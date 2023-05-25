import { authenticated, catchServerError } from '#rpc/middlewares';
import { assertManagePermissions } from '#rpc/utils';
import {
	YoutubeSettingsService,
	GetYoutubeSettingsRequest,
	GetYoutubeSettingsResponse,
	UpdateYoutubeSettingsRequest,
	UpdateYoutubeSettingsResponse
} from '@kbotdev/proto';
import { container } from '@sapphire/framework';
import * as connect from '@bufbuild/connect';
import type { PartialMessage } from '@bufbuild/protobuf';
import type { ServiceImpl, ConnectRouter } from '@bufbuild/connect';

export function registerYoutubeSettingsService(router: ConnectRouter): void {
	router.service(YoutubeSettingsService, new YoutubeSettingsServiceImpl());
}

class YoutubeSettingsServiceImpl implements ServiceImpl<typeof YoutubeSettingsService> {
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
