import { serverTransport } from './transports';
import { createPromiseClient } from '@bufbuild/connect';
import { UtilitySettingsService } from '@kbotdev/proto';

const server = createPromiseClient(UtilitySettingsService, serverTransport());

export const useUtilitySettingsServer = () => server;
