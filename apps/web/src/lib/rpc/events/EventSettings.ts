import { serverTransport } from '../transports';
import { createPromiseClient } from '@bufbuild/connect';
import { EventSettingsService } from '@kbotdev/proto';

const server = createPromiseClient(EventSettingsService, serverTransport());

export const useEventSettingsServer = () => server;
