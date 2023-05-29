import { Piece } from '@sapphire/framework';
import type { ConnectRouter } from '@bufbuild/connect';

export abstract class gRPCService extends Piece {
	public abstract register(router: ConnectRouter): void;
}
