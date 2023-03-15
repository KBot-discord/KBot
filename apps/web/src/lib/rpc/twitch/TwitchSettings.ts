import { serverTransport } from '../transports';
import { createPromiseClient } from '@bufbuild/connect';
import { TwitchSettingsService } from '@kbotdev/proto';

const server = createPromiseClient(TwitchSettingsService, serverTransport);

export const useTwitchSettingsServer = () => server;
