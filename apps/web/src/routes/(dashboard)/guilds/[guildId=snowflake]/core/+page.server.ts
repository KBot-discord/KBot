import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { env } from '$env/dynamic/public';

export const load: PageServerLoad = ({ locals, cookies }) => {
	const cookie = cookies.get(env.PUBLIC_COOKIE);
	if (!cookie || !locals.guild) {
		throw redirect(302, '/guilds');
	}

	return {};
};

export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		console.log(data);
	}
};
