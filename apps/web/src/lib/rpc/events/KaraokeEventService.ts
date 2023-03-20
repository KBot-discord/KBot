import { serverTransport } from '../transports';
import { createPromiseClient } from '@bufbuild/connect';
import { KaraokeEventService } from '@kbotdev/proto';

const server = createPromiseClient(KaraokeEventService, serverTransport());

export const useKaraokeEventServer = () => server;
