import { Piece } from '@sapphire/framework';
import type { ConnectRouter } from '@bufbuild/connect';

export abstract class gRPCService extends Piece {
	/**
	 * Register the gRPC service.
	 * @param router - The router to register the service to
	 */
	public abstract register(router: ConnectRouter): void;
}
