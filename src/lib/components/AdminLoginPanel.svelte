<script lang="ts">
	import { tick } from "svelte";
	import { fade, scale } from "svelte/transition";
	import { cubicOut } from "svelte/easing";
	import { afterNavigate } from "$app/navigation";
	import XIcon from "phosphor-svelte/lib/XIcon";
	import PrimaryButton from "$lib/components/PrimaryButton.svelte";
	import { login, resetPassword } from "$lib/auth/actions";
	import { uiStore, closeLogin, announce } from "$lib/utils/globalStates.svelte";
	import { modal, canRefocus } from "$lib/utils/modal";

	let mode = $state<"login" | "reset">("login");
	let email = $state("");
	let password = $state("");
	let pending = $state(false);
	let message = $state("");
	let isError = $state(false);
	let signedIn = false;
	let dialog = $state<HTMLDialogElement>();
	let emailInput = $state<HTMLInputElement>();
	// Element that had focus when the panel opened, refocused once it has closed
	let opener: HTMLElement | null = null;

	const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	const duration = () => (reducedMotion() ? 0 : 300);
	// The card settles in from slightly smaller; with reduced motion it simply appears
	const scaleParams = () => ({ start: 0.96, duration: duration(), easing: cubicOut });

	// Following a link out of the panel shouldn't leave it open over the new page
	afterNavigate(closeLogin);

	function onCancel(event: Event) {
		// Escape: close through state so the outro still plays
		event.preventDefault();
		closeLogin();
	}

	function onClosed() {
		const wasOpener = opener;
		mode = "login";
		email = "";
		password = "";
		message = "";
		isError = false;
		pending = false;
		opener = null;
		// The dialog is still modal until it's removed, which keeps the page inert; close it so focus can move back out
		dialog?.close();
		// Opened from ?admin, the opener is just the body; any real control gets focus back (the footer's Admin
		// button stays the same element when it turns into Log out)
		if (canRefocus(wasOpener) && wasOpener !== document.body) wasOpener.focus();
		if (signedIn) {
			signedIn = false;
			announce("Signed in as admin.");
		}
	}

	async function switchMode() {
		mode = mode === "login" ? "reset" : "login";
		message = "";
		isError = false;
		// The toggle's own label changes, so keep the user in the form rather than leaving focus on it
		await tick();
		emailInput?.focus();
	}

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		if (pending) return;
		pending = true;
		message = "";
		const result = mode === "login" ? await login(email, password) : await resetPassword(email);
		pending = false;

		if (!result.ok) {
			message = result.message;
			isError = true;
			return;
		}
		if (mode === "login") {
			password = "";
			signedIn = true;
			closeLogin();
		} else {
			message = "If an account exists for that email, a reset link is on its way. Check your spam folder too.";
			isError = false;
			mode = "login";
		}
	}
</script>

{#if uiStore.loginOpen}
	<dialog class="admin-login" bind:this={dialog} use:modal={(el) => (opener = el)} aria-labelledby="admin-login-heading" oncancel={onCancel}>
		<div class="admin-login-backdrop modal-backdrop" aria-hidden="true" onclick={closeLogin} transition:fade={{ duration: duration() }}></div>

		<div class="admin-login-card" transition:scale={scaleParams()} onoutroend={onClosed}>
			<button class="admin-login-close" aria-label="Close admin login" onclick={closeLogin}>
				<XIcon aria-hidden="true" />
			</button>

			<div class="admin-login-heading">
				<p class="eyebrow" aria-hidden="true">Admin</p>
				<h2 id="admin-login-heading">{mode === "login" ? "Admin login" : "Reset password"}</h2>
			</div>

			{#if mode === "reset"}
				<p class="admin-login-intro">Enter your email and we'll send you a link to choose a new password.</p>
			{/if}

			<form class="admin-login-form" aria-busy={pending} onsubmit={submit}>
				<div class="admin-login-field">
					<label for="admin-login-email">Email</label>
					<!-- svelte-ignore a11y_autofocus -->
					<input
						id="admin-login-email"
						type="email"
						autocomplete="username"
						autocapitalize="off"
						spellcheck="false"
						required
						autofocus
						aria-describedby={message ? "admin-login-message" : undefined}
						bind:this={emailInput}
						bind:value={email}
					/>
				</div>

				{#if mode === "login"}
					<div class="admin-login-field">
						<label for="admin-login-password">Password</label>
						<input
							id="admin-login-password"
							type="password"
							autocomplete="current-password"
							required
							aria-describedby={message ? "admin-login-message" : undefined}
							bind:value={password}
						/>
					</div>
				{/if}

				<!-- Two stable regions, as swapping one element's role isn't reliably announced: errors interrupt, notices wait -->
				<div class="admin-login-messages" id="admin-login-message">
					<p class="admin-login-message error" role="alert">{isError ? message : ""}</p>
					<p class="admin-login-message" role="status">{isError ? "" : message}</p>
				</div>

				<div class="admin-login-actions">
					<PrimaryButton type="submit" text={pending ? "Please wait…" : mode === "login" ? "Log in" : "Send reset link"} />
					<PrimaryButton primary={false} text={mode === "login" ? "Forgot password?" : "Back to login"} onAction={switchMode} />
				</div>
			</form>
		</div>
	</dialog>
{/if}

<style>
	/* Transparent full-screen shell; the backdrop and card inside it carry the visuals so they can transition */
	dialog.admin-login {
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

	dialog.admin-login::backdrop {
		background: none;
	}

	div.admin-login-backdrop {
		position: absolute;
		inset: 0;
	}

	/* Scrolls inside itself if a short landscape phone can't fit it */
	div.admin-login-card {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-l);
		width: 100%;
		max-width: 26rem;
		max-height: 100%;
		overflow-y: auto;
		padding: var(--spacing-xl) var(--spacing-l) var(--spacing-l);
		border-radius: var(--border-radius);
		box-shadow: var(--shadow);
		color: var(--color-text);
		/* Texture at 50% over peach, as on the contact panel */
		background-color: var(--color-background-peach);
		background-image: linear-gradient(color-mix(in srgb, var(--color-background-peach) 50%, transparent)), url(/assets/images/texture-offerings.webp);
		background-size: cover;
	}

	button.admin-login-close {
		position: absolute;
		top: var(--spacing-s);
		right: var(--spacing-s);
		display: grid;
		place-items: center;
		width: 44px;
		height: 44px;
		padding: 0;
		border: 0;
		border-radius: 50%;
		background: none;
		/* The icon is 1em in currentColor */
		color: var(--color-primary);
		font-size: 24px;
	}

	div.admin-login-heading {
		position: relative;
	}

	/* Smaller than a section's script, to suit the compact card */
	div.admin-login-heading .eyebrow {
		font-size: 56px;
	}

	div.admin-login-heading h2 {
		position: relative;
		font-family: var(--font-body);
		font-size: var(--font-heading-m);
		font-weight: 600;
		line-height: 1.05;
	}

	p.admin-login-intro {
		font-size: 16px;
		line-height: 1.4;
	}

	form.admin-login-form {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-m);
	}

	div.admin-login-field {
		display: flex;
		flex-direction: column;
	}

	div.admin-login-field label {
		font-size: 16px;
		font-weight: 500;
		letter-spacing: 0.8px;
	}

	/* The contact form's underlined fields */
	div.admin-login-field input {
		height: var(--spacing-l);
		padding: 0;
		border: 0;
		border-bottom: var(--border-width) solid var(--color-text);
		border-radius: 0;
		background: none;
		color: inherit;
		font-size: 16px;
	}

	/* Its messages take part in the form's gap directly, so the wrapper adds no gap while both are empty */
	div.admin-login-messages {
		display: contents;
	}

	p.admin-login-message {
		font-size: 14px;
		font-weight: 500;
		line-height: 1.3;
		letter-spacing: 0.05em;
	}

	/* Empty regions stay in the accessibility tree (display: none can stop the next message being announced),
	   but absolutely positioned they take no space and no part in the form's gap */
	p.admin-login-message:empty {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
	}

	p.admin-login-message.error {
		color: var(--color-error);
	}

	div.admin-login-actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--spacing-m) var(--spacing-l);
		margin-top: var(--spacing-s);
	}

	@media (forced-colors: active) {
		div.admin-login-card {
			border: 1px solid CanvasText;
		}
	}
</style>
