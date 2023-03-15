import { serverTransport } from '../transports';
import { createPromiseClient } from '@bufbuild/connect';
import { YoutubeChannelService } from '@kbotdev/proto';

const server = createPromiseClient(YoutubeChannelService, serverTransport);

export const useYoutubeChannelServer = () => server;
