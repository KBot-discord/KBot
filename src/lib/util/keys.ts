import { brotliCompressSync, brotliDecompressSync } from 'node:zlib';
import { deserialize, serialize } from 'binarytf';
import type { Key } from '../types/keys';

export function buildKey<T>(prefix: string, params: T): Key {
	return `${prefix};${brotliCompressSync(serialize<T>(params)).toString('binary')}` as Key;
}

export function parseKey<T>(content: Key) {
	const { 1: data } = content.split(';');
	return deserialize<T>(brotliDecompressSync(Buffer.from(data, 'binary')));
}
