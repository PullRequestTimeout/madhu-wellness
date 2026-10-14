<!-- Wraps each character in a span so .heading-fade-in can animate letter by letter -->
<!-- Usage: <h2 class="heading-fade-in" use:isIntersecting><SpanifyText text="Hello" /></h2> -->
<!-- offset continues the stagger from an earlier SpanifyText in the same heading (its letter count so far) -->
<script lang="ts">
	let { text = "", offset = 0 }: { text: string; offset?: number } = $props();
</script>

{#each text.split("") as char, i}
	<span style="transition-delay: {(offset + i) * 25}ms">{char}</span>
{/each}

<style>
	span {
		font: inherit;
	}
</style>
