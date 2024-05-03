import { container } from '@sapphire/framework';
import { join } from 'path';
import type { StoreRegistryEntries } from '@sapphire/framework';

/**
 * Registers the store in the provided root folder.
 * @param store - The name of the store
 * @param root - The path to the folder
 */
export function registerPieces(store: keyof StoreRegistryEntries, root: string): void {
	container.stores.get(store).registerPath(join(root, store));
}
