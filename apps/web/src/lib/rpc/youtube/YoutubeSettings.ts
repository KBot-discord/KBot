import { serverTransport } from '../transports';
import { createPromiseClient } from '@bufbuild/connect';
import { YoutubeSettingsService } from '@kbotdev/proto';

const server = createPromiseClient(YoutubeSettingsService, serverTransport());

export const useYoutubeSettingsServer = () => server;
