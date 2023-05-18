import { createConnectTransport as connectNode } from '@bufbuild/connect-node';
import { env } from '$env/dynamic/private';
import type { Transport } from '@bufbuild/connect';

let transport: Transport | null = null;

export function getServerTransport(): Transport {
	if (transport) return transport;

	transport = connectNode({
		httpVersion: '2',
		baseUrl: env.BASE_RPC_URL!
	});

	return transport;
}
