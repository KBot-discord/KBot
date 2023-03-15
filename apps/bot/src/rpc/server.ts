import { registerCoreSettingsService } from './services/core/CoreSettingsService';
import { registerDiscordService } from './services/discord/DiscordService';
import { registerEventSettingsService } from './services/events/EventsSettingsService';
import { registerKaraokeService } from './services/events/KaraokeService';
import { registerModerationCasesService } from './services/moderation/ModerationCasesService';
import { registerModerationSettingsService } from './services/moderation/ModerationSettingsService';
import { registerTwitchAccountService } from './services/twitch/TwitchAccountService';
import { registerTwitchSettingsService } from './services/twitch/TwitchSettingsService';
import { registerTwitchSubscriptionService } from './services/twitch/TwitchSubscriptionService';
import { registerUtilitySettingsService } from './services/utility/UtilitySettingsService';
import { registerWelcomeSettingsService } from './services/welcome/WelcomeSettingsService';
import { registerYoutubeChannelService } from './services/youtube/YoutubeChannelService';
import { registerYoutubeSettingsService } from './services/youtube/YoutubeSettingsService';
import { registerYoutubeSubscriptionService } from './services/youtube/YoutubeSubscriptionService';
import { connectNodeAdapter } from '@bufbuild/connect-node';
import * as http2 from 'http2';
import type { ConnectRouter } from '@bufbuild/connect';

function routes(router: ConnectRouter) {
	registerCoreSettingsService(router);
	registerDiscordService(router);
	registerEventSettingsService(router);
	registerKaraokeService(router);
	registerModerationCasesService(router);
	registerModerationSettingsService(router);
	registerTwitchAccountService(router);
	registerTwitchSettingsService(router);
	registerTwitchSubscriptionService(router);
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
