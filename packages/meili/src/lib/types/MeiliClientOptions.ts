import type { Config } from 'meilisearch';

export type MeiliClientOptions = Config & {
	port: number;
};
