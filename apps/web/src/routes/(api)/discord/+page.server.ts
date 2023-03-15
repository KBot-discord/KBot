import { redirect } from '@sveltejs/kit';

export const load = () => {
	throw redirect(302, 'https://discord.gg/4bXGu4Gf4c');
};
