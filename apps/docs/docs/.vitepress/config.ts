import { defineConfig } from "vitepress";
import { createWriteStream } from "node:fs";
import { resolve } from "node:path";
import { SitemapStream } from "sitemap";

const plusIcon =
	'<svg fill="#000000" height="800px" width="800px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300.003 300.003" xml:space="preserve"><g><g><path d="M150,0C67.159,0,0.001,67.159,0.001,150c0,82.838,67.157,150.003,149.997,150.003S300.002,232.838,300.002,150 C300.002,67.159,232.839,0,150,0z M213.281,166.501h-48.27v50.469c-0.003,8.463-6.863,15.323-15.328,15.323 c-8.468,0-15.328-6.86-15.328-15.328v-50.464H87.37c-8.466-0.003-15.323-6.863-15.328-15.328c0-8.463,6.863-15.326,15.328-15.328 l46.984,0.003V91.057c0-8.466,6.863-15.328,15.326-15.328c8.468,0,15.331,6.863,15.328,15.328l0.003,44.787l48.265,0.005 c8.466-0.005,15.331,6.86,15.328,15.328C228.607,159.643,221.742,166.501,213.281,166.501z"/></g></g></svg>';
const links: { url: string; lastmod: number | undefined }[] = [];

export default defineConfig({
	base: "/",
	lang: "en-US",
	title: "KBot Documentation",
	description: "Documentation for KBot",
	lastUpdated: true,
	cleanUrls: true,

	themeConfig: {
		logo: "/assets/logo.png",

		socialLinks: [
			{ icon: "github", link: "https://github.com/kbot-discord/kbot" },
			{ icon: "discord", link: "https://kbot.ca/discord" },
			{ icon: { svg: plusIcon }, link: "https://kbot.ca/invite" },
		],

		editLink: {
			pattern:
				"https://github.com/kbot-discord/docs/edit/main/docs/:path",
			text: "Suggest changes to this page",
		},

		nav: [
			{ text: "Introduction", link: "/what-does-kbot-do" },
			{ text: "Getting Started", link: "/getting-started" },
			{ text: "Commands", link: "/commands" },
		],

		sidebar: [
			{
				text: "What does KBot do?",
				link: "/what-does-kbot-do",
			},
			{
				text: "Getting Started",
				link: "/getting-started",
			},
			{
				text: "Commands",
				link: "/commands",
			},
			{
				text: "Configuration",
				items: [
					{ text: "Permissions", link: "/configuration/permissions" },
					{ text: "Modules", link: "/configuration/modules" },
				],
			},
			{
				text: "Modules",
				items: [
					{
						text: "Events",
						items: [{ text: "Karaoke", link: "/events/karaoke" }],
					},
					{
						text: "Moderation",
						items: [
							{
								text: "Anti-Hoist",
								link: "/moderation/anti-hoist",
							},
							{ text: "Minage", link: "/moderation/minage" },
							{ text: "Report", link: "/moderation/report" },
						],
					},
					{
						text: "Notifications",
						items: [
							{ text: "YouTube", link: "/notifications/youtube" },
						],
					},
					{
						text: "Utility",
						items: [
							{
								text: "Discord Status",
								link: "/utility/discord-status",
							},
							{
								text: "Emote Credits",
								link: "/utility/emote-credits",
							},
							{
								text: "Polls",
								link: "/utility/polls",
							},
						],
					},
					{
						text: "Welcome",
						items: [
							{
								text: "Overview",
								link: "/welcome/overview",
							},
						],
					},
				],
			},
		],
	},

	vite: {
		plugins: [],
	},

	head: [
		["meta", { charset: "utf-8" }],
		[
			"meta",
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
		],
		[
			"link",
			{
				rel: "apple-touch-icon",
				sizes: "180x180",
				href: "/apple-touch-icon.png",
			},
		],
		[
			"link",
			{
				rel: "icon",
				type: "image/png",
				sizes: "32x32",
				href: "/favicon-32x32.png",
			},
		],
		[
			"link",
			{
				rel: "icon",
				type: "image/png",
				sizes: "16x16",
				href: "/favicon-16x16.png",
			},
		],
		["link", { rel: "manifest", href: "/site.webmanifest" }],
		["link", { rel: "shortcut icon", href: "/favicon.ico" }],

		// OpenGraph
		["meta", { property: "og:url", content: "https://docs.kbot.ca/" }],
		["meta", { property: "og:type", content: "website" }],
		["meta", { property: "og:title", content: "KBot Documentation" }],
		[
			"meta",
			{ property: "og:description", content: "Documentation for KBot" },
		],
		[
			"meta",
			{
				property: "theme-color",
				"data-react-helmet": "true",
				content: "#006BFC",
			},
		],

		// Twitter
		["meta", { property: "twitter:card", content: "summary" }],
		["meta", { property: "twitter:url", content: "https://docs.kbot.ca/" }],
		["meta", { property: "twitter:title", content: "KBot Documentation" }],
		[
			"meta",
			{
				property: "twitter:description",
				content: "Documentation for KBot",
			},
		],
	],

	transformHtml: (_, id, { pageData }) => {
		if (!/[\\/]404\.html$/.test(id))
			links.push({
				url: pageData.relativePath.replace(/((^|\/)index)?\.md$/, "$2"),
				lastmod: pageData.lastUpdated,
			});
	},

	buildEnd: async ({ outDir }) => {
		const sitemap = new SitemapStream({
			hostname: "https://docs.kbot.ca/",
		});
		const writeStream = createWriteStream(resolve(outDir, "sitemap.xml"));
		sitemap.pipe(writeStream);
		links.forEach((link) => sitemap.write(link));
		sitemap.end();
		await new Promise((result) => writeStream.on("finish", result));
	},
});
