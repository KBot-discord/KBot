import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/kit/vite';
import { resolve } from 'path';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			out: 'build'
		}),
		alias: {
			$components: resolve('./src/lib/components'),
			$rpc: resolve('./src/lib/rpc'),
			$stores: resolve('./src/lib/stores')
		}
	}
};

export default config;
