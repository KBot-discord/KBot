import { serverTransport } from '../transports';
import { createPromiseClient } from '@bufbuild/connect';
import { TwitchAccountService } from '@kbotdev/proto';

const server = createPromiseClient(TwitchAccountService, serverTransport);

export const useTwitchAccountServer = () => server;
