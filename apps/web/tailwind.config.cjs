/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: 'class',
	content: [
		'./src/**/*.{html,svelte,ts}',
		require('path').join(
			require.resolve('@skeletonlabs/skeleton'),
			'../**/*.{html,js,svelte,ts}'
		)
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
		...require('@skeletonlabs/skeleton/tailwind/skeleton.cjs')()
	]
};
