import { createConnectTransport as connectNode } from '@bufbuild/connect-node';
import { PUBLIC_BASE_RPC_URL } from '$env/static/public';

export const serverTransport = connectNode({
	httpVersion: '2',
	baseUrl: PUBLIC_BASE_RPC_URL
});
