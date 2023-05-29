import { gRPCService } from '#plugins/grpc/lib/structures/gRPCService';
import { Store } from '@sapphire/framework';

export class gRPCStore extends Store<gRPCService> {
	public constructor() {
		super(gRPCService, { name: 'grpc-services' });
	}
}
