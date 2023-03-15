import { serverTransport } from './transports';
import { createPromiseClient } from '@bufbuild/connect';
import { WelcomeSettingsService } from '@kbotdev/proto';

const server = createPromiseClient(WelcomeSettingsService, serverTransport);

export const useWelcomeSettingsServer = () => server;
