import DefaultTheme from "vitepress/theme";
// @ts-ignore
import KofiButton from "../components/KofiButton.vue";
// @ts-ignore
import Badge from "vitepress/dist/client/theme-default/components/VPBadge.vue";
import type { Theme } from "vitepress";

import "./theme.css";

const theme: Theme = {
	...DefaultTheme,
	enhanceApp({ app }) {
		app.component("KofiButton", KofiButton);
		app.component("Badge", Badge);
	},
};

export default theme;
