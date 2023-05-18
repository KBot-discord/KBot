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
import { createServer } from 'http2';
import type { ConnectRouter } from '@bufbuild/connect';

function routes(router: ConnectRouter): void {
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

export const connectServer = createServer(
	connectNodeAdapter({
		routes, //
		connect: true,
		grpc: false,
		grpcWeb: false
	})
);
