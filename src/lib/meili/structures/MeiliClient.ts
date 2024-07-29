import { MeiliSearch } from 'meilisearch';
import type { EnqueuedTask, SearchResponse } from 'meilisearch';
import type { MeiliClientOptions } from '../types/MeiliClientOptions.js';
import { MeiliCategories } from '../types/MeiliTypes.js';
import type { MeiliDocument, MeiliIndex } from '../types/MeiliTypes.js';

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
			host: `http://${options.host}:${options.port}`,
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
	public async get<I extends MeiliIndex>(index: I, searchString: string): Promise<SearchResponse<MeiliDocument<I>>> {
		const result = await super
			.index(index) //
			.search<MeiliDocument<I>>(searchString, {
				limit: 25,
			});

		return result;
	}

	/**
	 * Add or replace multiple documents to an index
	 * @param index - The index to upsert to
	 * @param documents - The documents to upsert
	 * @returns The resulting task of the operation
	 */
	public async upsertMany<I extends MeiliIndex>(
		index: I,
		documents: MeiliDocument<typeof index>[],
	): Promise<EnqueuedTask> {
		return await super
			.index(index) //
			.addDocuments(documents);
	}

	/**
	 * Clear an index and set new documents to it.
	 * @param index - The index to clear
	 * @param documents - The documents to add
	 * @returns The resulting task of the operation
	 */
	public async resetIndex<I extends MeiliIndex>(
		index: I,
		documents: MeiliDocument<typeof index>[],
	): Promise<EnqueuedTask> {
		await super.index(index).deleteAllDocuments();
		return await super
			.index(index) //
			.updateDocuments(documents);
	}
}
