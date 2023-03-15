import { serverTransport } from '../transports';
import { createPromiseClient } from '@bufbuild/connect';
import { YoutubeSubscriptionService } from '@kbotdev/proto';

const server = createPromiseClient(YoutubeSubscriptionService, serverTransport);

export const useYoutubeSubscriptionsServer = () => server;
