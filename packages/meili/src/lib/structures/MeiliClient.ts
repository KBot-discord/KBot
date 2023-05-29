import { MeiliCategories } from '../types/MeiliTypes';
import { MeiliSearch } from 'meilisearch';
import type { MeiliDocument, MeiliIndex } from '../types/MeiliTypes';
import type { EnqueuedTask, SearchResponse } from 'meilisearch';
import type { MeiliClientOptions } from '../types/MeiliClientOptions';

/**
 * Wrapper for the `meilisearch` MeiliSearch class.
 */
export class MeilisearchClient extends MeiliSearch {
	/**
	 * The options to pass to the {@link MeilisearchClient}.
	 * @param options - The {@link MeiliClientOptions} to pass
	 */
	public constructor(options: MeiliClientOptions) {
		super({
			...options,
			host: `http://${options.host}:${options.port}`
		});
	}

	/**
	 * Syncs the indexes in {@link MeiliCategories} to the MeiliSearch server.
	 */
	public async sync(): Promise<void> {
		const indexes = await super.getIndexes();

		for (const index of Object.values(MeiliCategories)) {
			if (!indexes.results.some(({ uid }) => index === uid)) {
				await super.createIndex(index);
			}
		}
	}

	/**
	 * Search for documents in an index
	 * @param index - The index to query
	 * @param searchString - The query
	 * @returns The {@link SearchResponse} of the query
	 */
	public async get<T = unknown>(index: MeiliIndex, searchString: string): Promise<SearchResponse<T>> {
		return super
			.index(index) //
			.search<MeiliDocument<typeof index>>(searchString, {
				limit: 25
			}) as unknown as Promise<SearchResponse<T>>;
	}

	/**
	 * Add or replace multiple documents to an index
	 * @param index - The index to upsert to
	 * @param documents - The documents to upsert
	 * @returns The resulting task of the operation
	 */
	public async upsertMany(index: MeiliIndex, documents: MeiliDocument<typeof index>[]): Promise<EnqueuedTask> {
		return super
			.index(index) //
			.addDocuments(documents);
	}

	/**
	 * Add or update multiple documents to an index
	 * @param index - The index to update
	 * @param documents - The documents to update
	 * @returns The resulting task of the operation
	 */
	public async updateMany(index: MeiliIndex, documents: MeiliDocument<typeof index>[]): Promise<EnqueuedTask> {
		return super
			.index(index) //
			.updateDocuments(documents);
	}

	/**
	 * Clear an index and set new documents to it.
	 * @param index - The index to clear
	 * @param documents - The documents to add
	 * @returns The resulting task of the operation
	 */
	public async resetIndex(index: MeiliIndex, documents: MeiliDocument<typeof index>[]): Promise<EnqueuedTask> {
		await super.index(index).deleteAllDocuments();
		return super
			.index(index) //
			.updateDocuments(documents);
	}
}
