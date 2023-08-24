<script lang="ts">
	import { MetaTags, type AdditionalRobotsProps } from 'svelte-meta-tags';

	export let title: string;
	export let guildName = '';
	export let disableTemplate = false;
	export let description = 'A multi-feature Discord bot.';
	export let logo = 'https://kbot.ca/images/logo.png';
	export let url = 'https://kbot.ca/';
	export let blockRobots = false;

	const robotsProps: AdditionalRobotsProps = blockRobots
		? {}
		: {
				noarchive: true,
				nosnippet: true,
				notranslate: true,
				noimageindex: true,
				maxSnippet: -1,
				maxImagePreview: 'none',
				maxVideoPreview: -1
		  };
</script>

<MetaTags
	title={guildName ? `${title} | ${guildName}` : title}
	titleTemplate={disableTemplate ? undefined : '%s | KBot'}
	{description}
	canonical={url}
	openGraph={{
		type: 'website',
		url,
		title,
		description,
		images: [{ url: logo, alt: 'KBot icon' }],
		siteName: 'KBot'
	}}
	twitter={{
		cardType: 'summary',
		title,
		description,
		image: logo,
		imageAlt: 'KBot icon'
	}}
	robots={blockRobots ? 'noindex,nofollow' : false}
	additionalRobotsProps={robotsProps}
/>

<svelte:head>
	<meta name="theme-color" data-react-helmet="true" content="#006BFC" />
</svelte:head>
