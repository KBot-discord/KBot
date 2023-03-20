import { serverTransport } from './transports';
import { createPromiseClient } from '@bufbuild/connect';
import { DiscordService } from '@kbotdev/proto';

const server = createPromiseClient(DiscordService, serverTransport());

export const useDiscordServer = () => server;
