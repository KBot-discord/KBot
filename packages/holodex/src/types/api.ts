export interface PaginatedResponse<T = unknown> {
	total: number;
	items: T[];
}
