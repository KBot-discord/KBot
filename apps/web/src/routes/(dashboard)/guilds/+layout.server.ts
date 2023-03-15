import type { LayoutServerLoad } from './$types';

export const prerender = false;
export const ssr = true;

export const load: LayoutServerLoad = ({ locals }) => {
	return { guilds: locals.guilds };
};
