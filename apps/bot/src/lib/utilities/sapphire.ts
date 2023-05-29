import { container } from '@sapphire/framework';
import { join } from 'path';
import type { StoreRegistryEntries } from '@sapphire/framework';

export function registerPieces(store: keyof StoreRegistryEntries, root: string): void {
	container.stores.get(store).registerPath(join(root, store));
}
