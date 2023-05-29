import { MeiliCategories } from '../types/MeiliTypes';
import { MeiliSearch } from 'meilisearch';
import type { MeiliDocument, MeiliIndex } from '../types/MeiliTypes';
import type { EnqueuedTask, SearchResponse } from 'meilisearch';
import type { MeiliClientOptions } from '../types/MeiliClientOptions';

export class MeilisearchClient extends MeiliSearch {
	public constructor(options: MeiliClientOptions) {
		super({
			...options,
			host: `http://${options.host}:${options.port}`
		});
	}

	public async sync(): Promise<void> {
		const indexes = await super.getIndexes();

		for (const index of Object.values(MeiliCategories)) {
			if (!indexes.results.some(({ uid }) => index === uid)) {
				await super.createIndex(index);
			}
		}
	}

	public async get<T = unknown>(index: MeiliIndex, searchString: string): Promise<SearchResponse<T>> {
		return super
			.index(index) //
			.search<MeiliDocument<typeof index>>(searchString, {
				limit: 25
			}) as unknown as Promise<SearchResponse<T>>;
	}

	public async upsertMany(index: MeiliIndex, documents: MeiliDocument<typeof index>[]): Promise<EnqueuedTask> {
		return super
			.index(index) //
			.addDocuments(documents);
	}

	public async update(index: MeiliIndex, document: MeiliDocument<typeof index>): Promise<EnqueuedTask> {
		return super
			.index(index) //
			.updateDocuments([document]);
	}

	public async updateMany(index: MeiliIndex, documents: MeiliDocument<typeof index>[]): Promise<EnqueuedTask> {
		return super
			.index(index) //
			.updateDocuments(documents);
	}

	public async resetIndex(index: MeiliIndex, documents: MeiliDocument<typeof index>[]): Promise<EnqueuedTask> {
		await super.index(index).deleteAllDocuments();
		return super
			.index(index) //
			.updateDocuments(documents);
	}
}
