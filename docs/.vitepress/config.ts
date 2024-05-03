import { defineConfig } from 'vitepress';

export default defineConfig({
	base: '/',
	lang: 'en-US',
	title: 'KBot Documentation',
	description: 'Documentation for KBot',
	lastUpdated: true,
	cleanUrls: true,
	sitemap: { hostname: 'https://docs.kbot.ca' },

	themeConfig: {
		logo: '/assets/logo.png',

		search: {
			provider: 'local'
		},

		editLink: {
			pattern: 'https://github.com/kbot-discord/KBot/edit/main/docs/:path',
			text: 'Suggest changes to this page'
		},

		nav: [
			{ text: 'Dashboard', link: 'https://kbot.ca' },
			{ text: 'Invite', link: 'https://kbot.ca/invite' },
			{ text: 'Support', link: 'https://kbot.ca/discord' },
			{
				text: 'Source Code',
				link: 'https://github.com/kbot-discord/kbot'
			},
			{ text: 'Status', link: 'https://status.kbot.ca/' }
		],

		sidebar: [
			{ text: 'Home', link: '/' },
			{ text: 'Commands', link: '/commands' },
			{ text: 'FAQ', link: '/faq' },
			{
				text: 'Configuration',
				items: [
					{ text: 'Getting Started', link: '/configuration/getting-started' },
					{ text: 'Permissions', link: '/configuration/permissions' }
				]
			},
			{
				text: 'Modules',
				items: [
					{
						text: 'Events',
						items: [{ text: 'Karaoke', link: '/events/karaoke' }]
					},
					{
						text: 'Moderation',
						items: [
							{ text: 'Anti-Hoist', link: '/moderation/anti-hoist' },
							{ text: 'Minage', link: '/moderation/minage' },
							{ text: 'Report', link: '/moderation/report' }
						]
					},
					{
						text: 'Notifications',
						items: [{ text: 'YouTube', link: '/notifications/youtube' }]
					},
					{
						text: 'Utility',
						items: [
							{ text: 'Discord Status', link: '/utility/discord-status' },
							{ text: 'Credits', link: '/utility/credits' },
							{ text: 'Polls', link: '/utility/polls' }
						]
					},
					{
						text: 'Welcome',
						items: [{ text: 'Overview', link: '/welcome/overview' }]
					}
				]
			},
			{
				text: 'References',
				items: [{ text: 'Time format', link: '/references/time-format' }]
			},
			{ text: 'Terms of Use', link: 'https://kbot.ca/terms' },
			{ text: 'Privacy Policy', link: 'https://kbot.ca/privacy' }
		]
	},

	vite: {
		plugins: []
	},

	head: [
		['meta', { charset: 'utf-8' }],
		[
			'meta',
			{
				name: 'viewport',
				content: 'width=device-width, initial-scale=1'
			}
		],
		[
			'link',
			{
				rel: 'apple-touch-icon',
				sizes: '180x180',
				href: '/apple-touch-icon.png'
			}
		],
		[
			'link',
			{
				rel: 'icon',
				type: 'image/png',
				sizes: '32x32',
				href: '/favicon-32x32.png'
			}
		],
		[
			'link',
			{
				rel: 'icon',
				type: 'image/png',
				sizes: '16x16',
				href: '/favicon-16x16.png'
			}
		],
		['link', { rel: 'manifest', href: '/site.webmanifest' }],
		['link', { rel: 'shortcut icon', href: '/favicon.ico' }],

		// OpenGraph
		['meta', { property: 'og:url', content: 'https://docs.kbot.ca/' }],
		['meta', { property: 'og:type', content: 'website' }],
		['meta', { property: 'og:title', content: 'KBot Documentation' }],
		['meta', { property: 'og:description', content: 'Documentation for KBot' }],
		[
			'meta',
			{
				property: 'theme-color',
				'data-react-helmet': 'true',
				content: '#006BFC'
			}
		],

		// Twitter
		['meta', { property: 'twitter:card', content: 'summary' }],
		['meta', { property: 'twitter:url', content: 'https://docs.kbot.ca/' }],
		['meta', { property: 'twitter:title', content: 'KBot Documentation' }],
		[
			'meta',
			{
				property: 'twitter:description',
				content: 'Documentation for KBot'
			}
		]
	],
});
