import { createSitemap } from 'svelte-sitemap/src/index.js';

createSitemap('https://kbot.ca', {
	changeFreq: 'daily',
	trailingSlashes: false,
	ignore: ['**/oauth/**']
});
