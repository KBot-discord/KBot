import { serverTransport } from '../transports';
import { createPromiseClient } from '@bufbuild/connect';
import { ModerationCasesService } from '@kbotdev/proto';

const server = createPromiseClient(ModerationCasesService, serverTransport);

export const useModerationCasesServer = () => server;
