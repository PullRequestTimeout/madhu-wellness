<script lang="ts">
	import ArrowRightIcon from "phosphor-svelte/lib/ArrowRightIcon";

	type PrimaryButtonProps = {
		href?: string;
		text?: string;
		// false renders the underlined text-link style that sits beside a CTA
		primary?: boolean;
		// For use on dark backgrounds/images: white pill, or white text link
		light?: boolean;
		type?: "button" | "submit" | "reset";
		// Waiting on the action it started (e.g. a form submitting): dimmed and marked aria-disabled, but still
		// focusable so focus isn't lost. The handler should ignore repeat presses itself.
		pending?: boolean;
		onAction?: (event: MouseEvent) => void;
	};

	let { href, text = "Button", primary = true, light = false, type = "button", pending = false, onAction }: PrimaryButtonProps = $props();

	const variant = $derived(`${primary ? "primary" : "secondary"}${light ? " light" : ""}`);
</script>

{#snippet content()}
	{#if primary}
		<div class="circle" aria-hidden="true">
			<span class="arrow"><ArrowRightIcon weight="bold" aria-hidden="true" /></span>
		</div>
	{/if}
	<span class="label">{text}</span>
{/snippet}

{#if href}
	<a {href} class={variant} onclick={(e) => onAction?.(e)}>
		{@render content()}
	</a>
{:else}
	<button {type} class={variant} aria-disabled={pending || undefined} onclick={(e) => onAction?.(e)}>
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
		/* Right padding leaves room for the 16px arrow circle and an 8px gap */
		padding: 8px 32px 8px 16px;
		border-radius: var(--border-radius-pill);
		background-color: var(--color-primary);
		color: var(--color-white);
		overflow: hidden;
		/* Background swaps instantly when the hover ends (see the hover rule) */
		transition:
			color 0.2s ease-out,
			background-color 0s;
	}

	a.primary.light,
	button.primary.light {
		background-color: var(--color-white);
		color: var(--color-primary);
	}

	span.label {
		position: relative;
		z-index: 1;
	}

	/* Arrow circle: covers the pill but is clipped to a 16px circle at the right, growing to fill it on hover */
	div.circle {
		position: absolute;
		inset: 0;
		pointer-events: none;
		background-color: var(--color-white);
		clip-path: circle(8px at calc(100% - 16px) 50%);
		transition: clip-path 0.2s ease-out;
	}

	/* The icon is 1em in currentColor, so its size and colour are set here */
	div.circle span.arrow {
		position: absolute;
		top: 50%;
		right: 8px;
		translate: 0 -50%;
		display: block;
		color: var(--color-primary);
		font-size: 16px;
		line-height: 0;
	}

	a.primary.light div.circle,
	button.primary.light div.circle {
		background-color: var(--color-primary);
	}

	a.primary.light div.circle span.arrow,
	button.primary.light div.circle span.arrow {
		color: var(--color-white);
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

	/* Pending: dimmed, and the hover fill is held back below */
	button[aria-disabled="true"] {
		opacity: 0.6;
		cursor: progress;
	}

	@media (hover: hover) {
		a.primary:hover div.circle,
		button.primary:not([aria-disabled="true"]):hover div.circle {
			clip-path: circle(150% at calc(100% - 16px) 50%);
		}

		/* Text takes the icon colour so it stays readable on the fill.
		   Once the circle has grown, the pill takes the circle colour so no
		   anti-aliased edge of the old background shows around the border. */
		a.primary:hover,
		button.primary:not([aria-disabled="true"]):hover {
			color: var(--color-primary);
			background-color: var(--color-white);
			transition:
				color 0.2s ease-out,
				background-color 0.05s ease-out 0.2s;
		}

		a.primary.light:hover,
		button.primary.light:not([aria-disabled="true"]):hover {
			color: var(--color-white);
			background-color: var(--color-primary);
		}

		a.secondary:hover,
		button.secondary:hover {
			text-decoration-thickness: 2px;
		}
	}
</style>
