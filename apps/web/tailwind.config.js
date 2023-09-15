import { skeleton } from '@skeletonlabs/tw-plugin';
import { join } from 'path';
import { DefaultTheme } from './src/lib/themes/defaulTheme';

/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: 'class',
	content: [
		'./src/**/*.{html,svelte,ts}',
		join(require.resolve('@skeletonlabs/skeleton'), '../**/*.{html,js,svelte,ts}')
	],
	theme: {
		screens: {
			xs: '540px',
			sm: '640px',
			md: '768px',
			lg: '1024px',
			xl: '1280px',
			'2xl': '1536px'
		},
		extend: {}
	},
	plugins: [
		require('@tailwindcss/forms'),
		skeleton({
			themes: {
				custom: [DefaultTheme]
			}
		})
	]
};
