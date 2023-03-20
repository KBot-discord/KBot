import { serverTransport } from './transports';
import { createPromiseClient } from '@bufbuild/connect';
import { CoreSettingsService } from '@kbotdev/proto';

const server = createPromiseClient(CoreSettingsService, serverTransport());

export const useCoreSettingsServer = () => server;
