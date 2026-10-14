<script lang="ts">
	type PrimaryButtonProps = {
		href?: string;
		text?: string;
		// false renders the underlined text-link style that sits beside a CTA
		primary?: boolean;
		// For use on dark backgrounds/images: white pill, or white text link
		light?: boolean;
		type?: "button" | "submit" | "reset";
		onAction?: (event: MouseEvent) => void;
	};

	let { href, text = "Button", primary = true, light = false, type = "button", onAction }: PrimaryButtonProps = $props();

	let buttonEl: HTMLAnchorElement | HTMLButtonElement | undefined = $state();
	let mousePos = $state({ x: 0, y: 0 });

	const variant = $derived(`${primary ? "primary" : "secondary"}${light ? " light" : ""}`);
	const arrowSrc = $derived(light ? "/assets/svgs/arrow-circle-dark.svg" : "/assets/svgs/arrow-circle-light.svg");

	// Ripple originates from where the cursor entered
	function getMousePos(event: MouseEvent) {
		if (!buttonEl) return;
		const rect = buttonEl.getBoundingClientRect();
		mousePos = { x: event.clientX - rect.left, y: event.clientY - rect.top };
	}
</script>

{#snippet content()}
	<span>{text}</span>
	{#if primary}
		<img class="arrow" src={arrowSrc} alt="" width="16" height="16" />
		<div class="ripple" style="--top: {mousePos.y}px; --left: {mousePos.x}px;"></div>
	{/if}
{/snippet}

{#if href}
	<a bind:this={buttonEl} {href} class={variant} onmouseenter={getMousePos} onclick={(e) => onAction?.(e)}>
		{@render content()}
	</a>
{:else}
	<button bind:this={buttonEl} {type} class={variant} onmouseenter={getMousePos} onclick={(e) => onAction?.(e)}>
		{@render content()}
	</button>
{/if}

<style>
	a,
	button {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		border: 0;
		font-size: 16px;
		font-weight: 500;
		line-height: 1;
		white-space: nowrap;
		width: fit-content;
	}

	/* Pill CTA */
	a.primary,
	button.primary {
		padding: 8px 8px 8px 16px;
		border-radius: var(--border-radius-pill);
		background-color: var(--color-primary);
		color: var(--color-white);
		overflow: hidden;
	}

	a.primary.light,
	button.primary.light {
		background-color: var(--color-white);
		color: var(--color-primary);
	}

	a span,
	button span,
	img.arrow {
		position: relative;
		z-index: 1;
	}

	img.arrow {
		flex-shrink: 0;
		transition: transform 0.25s ease-out;
	}

	div.ripple {
		position: absolute;
		top: var(--top);
		left: var(--left);
		transform: translate(-50%, -50%);
		width: 0;
		height: 0;
		border-radius: 50%;
		pointer-events: none;
		background-color: var(--color-brown-mid);
		transition:
			width 0.4s ease-out,
			height 0.4s ease-out;
	}

	a.primary.light div.ripple,
	button.primary.light div.ripple {
		background-color: var(--color-cream);
	}

	/* Text link */
	a.secondary,
	button.secondary {
		padding: 0;
		background: none;
		color: var(--color-text);
		letter-spacing: 0.8px;
		text-decoration: underline;
		text-underline-position: from-font;
		text-decoration-thickness: from-font;
	}

	a.secondary.light,
	button.secondary.light {
		color: var(--color-white);
	}

	@media (hover: hover) {
		a.primary:hover div.ripple,
		button.primary:hover div.ripple {
			width: 30rem;
			height: 30rem;
		}

		a.primary:hover img.arrow,
		button.primary:hover img.arrow {
			transform: translateX(2px);
		}

		a.secondary:hover,
		button.secondary:hover {
			text-decoration-thickness: 2px;
		}
	}
</style>
