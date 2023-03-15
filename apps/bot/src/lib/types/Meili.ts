export const MeiliCategories = {
	Commands: 'commands'
} as const;

export type MeiliIndex = (typeof MeiliCategories)[keyof typeof MeiliCategories];

export type MeiliDocument<T extends MeiliIndex> = T extends typeof MeiliCategories.Commands ? DocumentCommand : never;

interface DocumentBase {
	id: string;
}

export interface DocumentCommand extends DocumentBase {
	name: string;
	description: string;
}
