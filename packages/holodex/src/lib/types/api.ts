export type PaginatedResponse<T = unknown> = {
	total: number;
	items: T[];
};
