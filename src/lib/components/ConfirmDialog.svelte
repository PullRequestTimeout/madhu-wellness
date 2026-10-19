<script lang="ts">
	import { fade, scale } from "svelte/transition";
	import { cubicOut } from "svelte/easing";
	import { confirmState, settleConfirm } from "$lib/utils/confirm.svelte";
	import { modal, canRefocus } from "$lib/utils/modal";

	// Renders confirmDialog() requests (see $lib/utils/confirm.svelte). Mounted once, in the root layout. A native modal
	// dialog, so it sits in the top layer above anything else open (such as the event editor) and makes the page inert.

	let dialog = $state<HTMLDialogElement>();
	// Element that had focus when the dialog opened, refocused once it has closed if it's still there
	let opener: HTMLElement | null = null;
	const uid = $props.id();

	const duration = () => (window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 200);

	function onCancel(event: Event) {
		// Escape: answer through state so the outro still plays
		event.preventDefault();
		settleConfirm(false);
	}

	function onClosed() {
		const wasOpener = opener;
		opener = null;
		dialog?.close();
		if (canRefocus(wasOpener)) wasOpener.focus();
	}
</script>

{#if confirmState.open && confirmState.options}
	{@const options = confirmState.options}
	<dialog
		class="confirm"
		bind:this={dialog}
		use:modal={(el) => (opener = el)}
		aria-labelledby="{uid}-title"
		aria-describedby={options.message ? `${uid}-message` : undefined}
		oncancel={onCancel}
	>
		<div
			class="confirm-backdrop modal-backdrop"
			aria-hidden="true"
			onclick={() => settleConfirm(false)}
			transition:fade={{ duration: duration() }}
		></div>

		<div class="confirm-card" transition:scale={{ start: 0.96, duration: duration(), easing: cubicOut }} onoutroend={onClosed}>
			<h2 class="confirm-title" id="{uid}-title">{options.title}</h2>
			{#if options.message}<p class="confirm-message" id="{uid}-message">{options.message}</p>{/if}

			<div class="confirm-actions">
				<!-- Focus starts on Cancel, the safe answer -->
				<!-- svelte-ignore a11y_autofocus -->
				<button class="confirm-cancel" autofocus onclick={() => settleConfirm(false)}>{options.cancelText ?? "Cancel"}</button>
				<button class="confirm-ok" class:danger={options.danger} onclick={() => settleConfirm(true)}>{options.confirmText ?? "OK"}</button>
			</div>
		</div>
	</dialog>
{/if}

<style>
	/* Transparent full-screen shell; the backdrop and card inside it carry the visuals so they can transition */
	dialog.confirm {
		position: fixed;
		inset: 0;
		display: grid;
		place-items: center;
		width: auto;
		max-width: none;
		height: auto;
		max-height: none;
		margin: 0;
		/* Keeps the card --spacing-m from the screen edge on phones */
		padding: var(--spacing-m);
		border: 0;
		background: none;
		overflow: hidden;
	}

	dialog.confirm::backdrop {
		background: none;
	}

	div.confirm-backdrop {
		position: absolute;
		inset: 0;
	}

	/* As the admin login card: texture at 50% over peach */
	div.confirm-card {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-m);
		width: 100%;
		max-width: 26rem;
		max-height: 100%;
		overflow-y: auto;
		padding: var(--spacing-l);
		border-radius: var(--border-radius);
		box-shadow: var(--shadow);
		color: var(--color-text);
		background-color: var(--color-background-peach);
		background-image: linear-gradient(color-mix(in srgb, var(--color-background-peach) 50%, transparent)), url(/assets/images/texture-offerings.webp);
		background-size: cover;
	}

	h2.confirm-title {
		font-family: var(--font-body);
		font-size: var(--font-heading-s);
		font-weight: 600;
		line-height: 1.2;
		/* The delete title quotes the event's name, which could be long */
		overflow-wrap: anywhere;
	}

	p.confirm-message {
		font-size: 16px;
		line-height: 1.4;
		overflow-wrap: anywhere;
	}

	h2.confirm-title,
	p.confirm-message {
		text-align: center;
	}

	/* Mobile-first: stacked, the main action on top; side by side from tablet */
	div.confirm-actions {
		display: flex;
		flex-direction: column-reverse;
		gap: var(--spacing-s);
		margin-top: var(--spacing-s);
	}

	div.confirm-actions button {
		min-height: 44px;
		padding: 0 var(--spacing-l);
		border-radius: var(--border-radius-pill);
		font: inherit;
		font-size: 16px;
		font-weight: 600;
		cursor: pointer;
	}

	button.confirm-cancel {
		border: var(--border-width) solid var(--color-primary);
		background: none;
		color: var(--color-primary);
	}

	button.confirm-ok {
		border: var(--border-width) solid var(--color-primary);
		background-color: var(--color-primary);
		color: var(--color-white);
	}

	/* White on the error red is 9:1 */
	button.confirm-ok.danger {
		border-color: var(--color-error);
		background-color: var(--color-error);
	}

	@media (hover: hover) {
		button.confirm-cancel:hover {
			background-color: color-mix(in srgb, var(--color-primary) 12%, transparent);
		}

		button.confirm-ok:hover {
			background-color: var(--color-brown-dark);
			border-color: var(--color-brown-dark);
		}

		button.confirm-ok.danger:hover {
			background-color: color-mix(in srgb, var(--color-error) 85%, black);
			border-color: color-mix(in srgb, var(--color-error) 85%, black);
		}
	}

	@media (forced-colors: active) {
		div.confirm-card {
			border: 1px solid CanvasText;
		}
	}

	@media screen and (min-width: 768px) {
		div.confirm-actions {
			flex-direction: row;
			justify-content: center;
		}
	}
</style>
