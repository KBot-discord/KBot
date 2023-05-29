/**
 * A paginated response.
 * @typeParam T - The type of the objects in the paginated response
 */
export type PaginatedResponse<T = unknown> = {
	total: number;
	items: T[];
};
