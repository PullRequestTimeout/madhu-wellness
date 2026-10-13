<script lang="ts">
	import "material-icons/iconfont/filled.css";
	import Nav from "$lib/components/Nav.svelte";
	import Footer from "$lib/components/Footer.svelte";

	let { children } = $props();
</script>

<Nav />
{@render children()}
<Footer />
<!-- Global modals / CTAs shared by every page go here -->
