<script lang="ts">
	import { fly, fade } from "svelte/transition";
	import { flip } from "svelte/animate";
	import { cubicOut } from "svelte/easing";
	import CheckCircleIcon from "phosphor-svelte/lib/CheckCircleIcon";
	import WarningCircleIcon from "phosphor-svelte/lib/WarningCircleIcon";
	import InfoIcon from "phosphor-svelte/lib/InfoIcon";
	import XIcon from "phosphor-svelte/lib/XIcon";
	import { toasts, announcements, dismissToast, type Toast } from "$lib/utils/toast.svelte";
	import { canRefocus } from "$lib/utils/modal";

	// Renders the toasts raised with toast() from $lib/utils/toast.svelte. Mounted once, in the root layout.

	const ICONS = { success: CheckCircleIcon, error: WarningCircleIcon, info: InfoIcon };

	const duration = (ms: number) => (window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : ms);

	// Where keyboard focus was before it entered the toasts, so dismissing the last one can hand it back
	let returnFocus: HTMLElement | null = null;

	function onFocusIn(event: FocusEvent) {
		const from = event.relatedTarget as HTMLElement | null;
		if (!from?.closest("ol.toaster")) returnFocus = from;
	}

	// However the focused toast goes (dismissed, timed out, replaced by a duplicate or pushed off the stack), focus
	// moves on before it's removed rather than dropping to the top of the page. Keyboard users go to the next toast
	// still showing (ignoring any fading out), else back where they came from; a mouse click just lets focus go.
	$effect.pre(() => {
		const ids = new Set(toasts.map((t) => t.id));
		const active = document.activeElement as HTMLElement | null;
		const leaving = active?.closest<HTMLElement>("li.toast");
		if (!active || !leaving || ids.has(Number(leaving.dataset.id))) return;

		if (!active.matches(":focus-visible")) return active.blur();
		const staying = [...document.querySelectorAll<HTMLElement>("li.toast")].filter((li) => ids.has(Number(li.dataset.id)));
		const next = staying.find((li) => leaving.compareDocumentPosition(li) & Node.DOCUMENT_POSITION_FOLLOWING) ?? staying.at(-1);
		const button = next?.querySelector<HTMLElement>("button.toast-dismiss");
		if (button) button.focus();
		else if (canRefocus(returnFocus)) returnFocus.focus();
		else active.blur();
	});

	function onKeydown(id: number, event: KeyboardEvent) {
		if (event.key === "Escape") dismissToast(id);
	}

	// Dismisses the toast after its duration, pausing while it's hovered or has focus so it can't vanish mid-read
	function autoDismiss(node: HTMLElement, toast: Toast) {
		if (!toast.duration) return;
		let remaining = toast.duration;
		let started = 0;
		let timer: ReturnType<typeof setTimeout> | undefined;
		let hovered = false;
		let focused = false;

		const start = () => {
			started = Date.now();
			timer = setTimeout(() => dismissToast(toast.id), remaining);
		};
		const pause = () => {
			if (timer === undefined) return;
			clearTimeout(timer);
			timer = undefined;
			remaining -= Date.now() - started;
		};
		const update = () => (hovered || focused ? pause() : timer === undefined && start());

		const onEnter = () => ((hovered = true), update());
		const onLeave = () => ((hovered = false), update());
		const onFocusIn = () => ((focused = true), update());
		const onFocusOut = (event: FocusEvent) => {
			if (node.contains(event.relatedTarget as Node | null)) return;
			focused = false;
			update();
		};

		node.addEventListener("pointerenter", onEnter);
		node.addEventListener("pointerleave", onLeave);
		node.addEventListener("focusin", onFocusIn);
		node.addEventListener("focusout", onFocusOut);
		start();

		return {
			destroy() {
				clearTimeout(timer);
				node.removeEventListener("pointerenter", onEnter);
				node.removeEventListener("pointerleave", onLeave);
				node.removeEventListener("focusin", onFocusIn);
				node.removeEventListener("focusout", onFocusOut);
			}
		};
	}
</script>

<!-- Always present, so screen readers pick up each message as it arrives -->
<div class="visually-hidden" role="status">
	{#each announcements.polite as a (a.id)}<p>{a.message}</p>{/each}
</div>
<div class="visually-hidden" role="alert">
	{#each announcements.assertive as a (a.id)}<p>{a.message}</p>{/each}
</div>

{#if toasts.length}
	<ol class="toaster" aria-label="Notifications" onfocusin={onFocusIn}>
		{#each toasts as toast (toast.id)}
			{@const Icon = ICONS[toast.kind]}
			<!-- Escape on a focused toast dismisses it; the dismiss button is the keyboard route in -->
			<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
			<li
				class="toast toast-{toast.kind}"
				data-id={toast.id}
				onkeydown={(e) => onKeydown(toast.id, e)}
				use:autoDismiss={toast}
				animate:flip={{ duration: duration(250) }}
				in:fly={{ y: 16, duration: duration(300), easing: cubicOut }}
				out:fade={{ duration: duration(200) }}
			>
				<span class="toast-icon"><Icon weight="fill" aria-hidden="true" /></span>
				<p class="toast-message">{toast.message}</p>
				<button class="toast-dismiss" aria-label="Dismiss notification" onclick={() => dismissToast(toast.id)}>
					<XIcon aria-hidden="true" />
				</button>
			</li>
		{/each}
	</ol>
{/if}

<style>
	/* Bottom of the screen, clear of the edges on phones; bottom right from tablet up. Above the nav (z-index 1000) */
	ol.toaster {
		position: fixed;
		z-index: 1100;
		right: var(--spacing-m);
		bottom: var(--spacing-m);
		left: var(--spacing-m);
		display: flex;
		flex-direction: column;
		gap: var(--spacing-s);
		margin: 0;
		padding: 0;
		list-style: none;
		/* Clicks pass through the gaps between toasts */
		pointer-events: none;
	}

	li.toast {
		display: flex;
		align-items: flex-start;
		gap: var(--spacing-s);
		padding: 12px var(--spacing-s) 12px var(--spacing-m);
		border-radius: 10px;
		box-shadow: var(--shadow);
		background-color: var(--color-brown);
		color: var(--color-cream);
		font-size: 16px;
		line-height: 1.4;
		pointer-events: auto;
	}

	li.toast-error {
		background-color: var(--color-error);
		color: var(--color-white);
	}

	/* The icons are 1em in currentColor */
	span.toast-icon {
		display: flex;
		flex-shrink: 0;
		margin-top: 0.1em;
		font-size: 20px;
	}

	li.toast-success span.toast-icon {
		color: var(--color-tan);
	}

	p.toast-message {
		flex: 1;
		align-self: center;
		min-width: 0;
		overflow-wrap: anywhere;
	}

	/* 32px target, pulled up so it lines up with the first line of text */
	button.toast-dismiss {
		display: grid;
		flex-shrink: 0;
		place-items: center;
		width: 32px;
		height: 32px;
		margin-block: -4px;
		padding: 0;
		border: 0;
		border-radius: 50%;
		background: none;
		color: inherit;
		font-size: 18px;
	}

	@media (hover: hover) {
		button.toast-dismiss:hover {
			background-color: color-mix(in srgb, currentColor 15%, transparent);
		}
	}

	@media (forced-colors: active) {
		li.toast {
			border: 1px solid CanvasText;
		}
	}

	@media screen and (min-width: 768px) {
		ol.toaster {
			right: var(--spacing-l);
			bottom: var(--spacing-l);
			left: auto;
			width: 24rem;
		}
	}
</style>
