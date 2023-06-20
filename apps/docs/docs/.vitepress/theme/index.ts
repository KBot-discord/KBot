import './theme.css';

import DefaultTheme from 'vitepress/theme';
import KofiButton from '../components/KofiButton.vue';
import type { Theme } from 'vitepress';

// @ts-expect-error Theme is broken
const theme: Theme = {
	extends: DefaultTheme,
	enhanceApp({ app }) {
		app.component('KofiButton', KofiButton);
	}
};

export default theme;
