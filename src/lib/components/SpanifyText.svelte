<!-- Wraps each character in a span so .heading-fade-in can animate letter by letter -->
<!-- Usage: <h2 class="heading-fade-in" use:isIntersecting><SpanifyText text="Hello" /></h2> -->
<script lang="ts">
	let { text = "" }: { text: string } = $props();
</script>

{#each text.split("") as char, i}
	<span style="transition-delay: {i * 25}ms">{char}</span>
{/each}

<style>
	span {
		font: inherit;
	}
</style>
