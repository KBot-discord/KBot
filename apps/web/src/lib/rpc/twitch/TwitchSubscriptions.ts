import { serverTransport } from '../transports';
import { createPromiseClient } from '@bufbuild/connect';
import { TwitchSubscriptionService } from '@kbotdev/proto';

const server = createPromiseClient(TwitchSubscriptionService, serverTransport);

export const useTwitchSubscriptionsServer = () => server;
