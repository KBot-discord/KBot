export interface PatreonMeta {
	pagination: PatreonPagination;
}

export interface PatreonPagination {
	cursors: PatreonCursors;
	total: number;
}

export interface PatreonCursors {
	next: string;
}
