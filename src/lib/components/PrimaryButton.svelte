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

	const variant = $derived(`${primary ? "primary" : "secondary"}${light ? " light" : ""}`);
</script>

{#snippet content()}
	{#if primary}
		<div class="circle" aria-hidden="true">
			<span class="material-icons">arrow_forward</span>
		</div>
	{/if}
	<span class="label">{text}</span>
{/snippet}

{#if href}
	<a {href} class={variant} onclick={(e) => onAction?.(e)}>
		{@render content()}
	</a>
{:else}
	<button {type} class={variant} onclick={(e) => onAction?.(e)}>
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

	div.circle span.material-icons {
		position: absolute;
		top: 50%;
		right: 8px;
		translate: 0 -50%;
		color: var(--color-primary);
		font-size: 16px;
	}

	a.primary.light div.circle,
	button.primary.light div.circle {
		background-color: var(--color-primary);
	}

	a.primary.light div.circle span.material-icons,
	button.primary.light div.circle span.material-icons {
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

	@media (hover: hover) {
		a.primary:hover div.circle,
		button.primary:hover div.circle {
			clip-path: circle(150% at calc(100% - 16px) 50%);
		}

		/* Text takes the icon colour so it stays readable on the fill.
		   Once the circle has grown, the pill takes the circle colour so no
		   anti-aliased edge of the old background shows around the border. */
		a.primary:hover,
		button.primary:hover {
			color: var(--color-primary);
			background-color: var(--color-white);
			transition:
				color 0.2s ease-out,
				background-color 0.05s ease-out 0.2s;
		}

		a.primary.light:hover,
		button.primary.light:hover {
			color: var(--color-white);
			background-color: var(--color-primary);
		}

		a.secondary:hover,
		button.secondary:hover {
			text-decoration-thickness: 2px;
		}
	}
</style>
