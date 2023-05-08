import {
	registerCoreSettingsService,
	registerDiscordService,
	registerEventSettingsService,
	registerKaraokeService,
	registerModerationSettingsService,
	registerUtilitySettingsService,
	registerWelcomeSettingsService,
	registerYoutubeChannelService,
	registerYoutubeSettingsService,
	registerYoutubeSubscriptionService
} from '#rpc/services';
import { connectNodeAdapter } from '@bufbuild/connect-node';
import * as http2 from 'http2';
import type { ConnectRouter } from '@bufbuild/connect';

function routes(router: ConnectRouter) {
	registerCoreSettingsService(router);
	registerDiscordService(router);
	registerEventSettingsService(router);
	registerKaraokeService(router);
	registerModerationSettingsService(router);
	registerUtilitySettingsService(router);
	registerWelcomeSettingsService(router);
	registerYoutubeChannelService(router);
	registerYoutubeSettingsService(router);
	registerYoutubeSubscriptionService(router);
}

export const connectServer = http2.createServer(
	connectNodeAdapter({
		routes, //
		connect: true,
		grpc: false,
		grpcWeb: false
	})
);
