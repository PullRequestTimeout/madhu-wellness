<!-- Use in every +page.svelte with a page-specific title and description. OG image lives at static/assets/images/og-image.jpg -->
<script lang="ts">
	import { page } from "$app/state";

	let {
		title = "Madhu Wellness Collective",
		description = "Madhu Wellness Collective brings together classes, events, holistic treatments and trusted practitioners in one welcoming space."
	}: { title?: string; description?: string } = $props();
	const image = "/assets/images/og-image.jpg";
	const url = $derived(page.url.toString());
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />

	<meta property="og:type" content="website" />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={url} />
	<meta property="og:image" content={image} />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={image} />

	<meta name="robots" content="index, follow" />
	<link rel="canonical" href={url} />
</svelte:head>
