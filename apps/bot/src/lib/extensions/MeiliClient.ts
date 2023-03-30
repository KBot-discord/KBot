import { MeiliCategories } from '#types/Meili';
import { MeiliSearch } from 'meilisearch';
import { container } from '@sapphire/framework';
import type { SearchResponse } from 'meilisearch';
import type { MeiliDocument, MeiliIndex } from '#types/Meili';

export class MeilisearchClient extends MeiliSearch {
	public constructor() {
		const { host, port, apiKey } = container.config.meili;
		super({ host: `http://${host}:${port}`, apiKey });
	}

	public async sync(): Promise<void> {
		const indexes = await super.getIndexes();

		for (const index of Object.values(MeiliCategories)) {
			if (!indexes.results.some(({ uid }) => index === uid)) {
				await super.createIndex(index);
			}
		}
	}

	public async get<T = unknown>(index: MeiliIndex, searchString: string) {
		return super
			.index(index) //
			.search<MeiliDocument<typeof index>>(searchString, {
				limit: 25
			}) as unknown as Promise<SearchResponse<T>>;
	}

	public async upsertMany(index: MeiliIndex, documents: MeiliDocument<typeof index>[]) {
		return super
			.index(index) //
			.addDocuments(documents);
	}

	public async update(index: MeiliIndex, document: MeiliDocument<typeof index>) {
		return super
			.index(index) //
			.updateDocuments([document]);
	}

	public async updateMany(index: MeiliIndex, documents: MeiliDocument<typeof index>[]) {
		return super
			.index(index) //
			.updateDocuments(documents);
	}

	public async resetIndex(index: MeiliIndex, documents: MeiliDocument<typeof index>[]) {
		await super.index(index).deleteAllDocuments();
		return super
			.index(index) //
			.updateDocuments(documents);
	}
}
