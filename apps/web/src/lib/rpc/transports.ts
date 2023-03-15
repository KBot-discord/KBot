import { createConnectTransport as connectNode } from '@bufbuild/connect-node';
import { env } from '$env/dynamic/private';

export const serverTransport = connectNode({
	httpVersion: '2',
	baseUrl: env.BASE_RPC_URL
});
