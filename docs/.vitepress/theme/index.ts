import type { Theme } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
// @ts-expect-error Can't infer .vue types
import KofiButton from '../components/KofiButton.vue';

// Need to import CSS after for it to load
import './theme.css';

const theme: Theme = {
	extends: DefaultTheme,
	enhanceApp({ app }) {
		app.component('KofiButton', KofiButton);
	},
};

export default theme;
