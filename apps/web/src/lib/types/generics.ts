export type Expand<T> = T extends (...args: infer A) => infer R
	? (...args: Expand<A>) => Expand<R>
	: T extends infer O
	? { [K in keyof O]: O[K] }
	: never;

export type Nullish<T> = {
	[P in keyof T]?: T[P] | null;
};
