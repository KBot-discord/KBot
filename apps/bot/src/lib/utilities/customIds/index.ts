import { deserialize, serialize } from 'binarytf';
import { brotliCompressSync, brotliDecompressSync } from 'node:zlib';

export * from './addEmote';
export * from './karaoke';
export * from './poll';

export function buildCustomId<T = unknown>(prefix: string, data: T): string {
	return `${prefix};${brotliCompressSync(serialize(data)).toString('binary')}`;
}

export function parseCustomId<T>(CustomId: string): { prefix: string; data: T } {
	const { 0: prefix, 1: data } = CustomId.split(';');
	return { prefix, data: deserialize<T>(brotliDecompressSync(Buffer.from(data, 'binary'))) };
}
