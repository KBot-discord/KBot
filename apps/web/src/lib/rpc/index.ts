import { createPromiseClient, type PromiseClient } from '@bufbuild/connect';
import type { ServiceType } from '@bufbuild/protobuf';
import {
	CoreSettingsService,
	DiscordService,
	EventSettingsService,
	KaraokeEventService,
	ModerationSettingsService,
	UtilitySettingsService,
	WelcomeSettingsService,
	YoutubeChannelService,
	YoutubeSettingsService,
	YoutubeSubscriptionService
} from '@kbotdev/proto';
import { getServerTransport } from './transports';

export const Clients = {
	EventSettings: EventSettingsService,
	KaraokeEvent: KaraokeEventService,
	YoutubeChannels: YoutubeChannelService,
	YoutubeSettings: YoutubeSettingsService,
	YoutubeSubscriptions: YoutubeSubscriptionService,
	CoreSettings: CoreSettingsService,
	Discord: DiscordService,
	ModerationSettings: ModerationSettingsService,
	UtilitySettings: UtilitySettingsService,
	WelcomeSettings: WelcomeSettingsService
} as const;

const clients = new Map<string, PromiseClient<ServiceType>>();

export function useClient<T extends ServiceType>(service: T): PromiseClient<T> {
	const client = clients.get(service.typeName);
	if (client) return client as PromiseClient<T>;

	const newClient = createPromiseClient(service, getServerTransport());
	clients.set(service.typeName, newClient);

	return newClient;
}
