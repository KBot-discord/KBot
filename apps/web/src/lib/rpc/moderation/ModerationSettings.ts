import { serverTransport } from '../transports';
import { createPromiseClient } from '@bufbuild/connect';
import { ModerationSettingsService } from '@kbotdev/proto';

const server = createPromiseClient(ModerationSettingsService, serverTransport);

export const useModerationSettingsServer = () => server;
