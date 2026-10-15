<script lang="ts">
	import { tick } from "svelte";
	import { fade, fly } from "svelte/transition";
	import { cubicOut } from "svelte/easing";
	import { afterNavigate } from "$app/navigation";
	import XIcon from "phosphor-svelte/lib/XIcon";
	import PrimaryButton from "$lib/components/PrimaryButton.svelte";
	import { isIntersecting } from "$lib/utils/isIntersecting";
	import { uiStore, closeContact } from "$lib/utils/globalStates.svelte";

	let status = $state<"idle" | "sending" | "success" | "error">("idle");
	let statusEl = $state<HTMLParagraphElement>();
	let dialog = $state<HTMLDialogElement>();
	// Element that had focus when the panel opened, refocused once it has closed
	let opener: HTMLElement | null = null;

	// What fits in the 3-line message field at the 1440px design width (measured ~377), rounded down to the nearest 50.
	// Narrower layouts give the field more lines so the full limit always fits.
	const MESSAGE_LIMIT = 350;

	// Required fields are validated here rather than by the browser (the form is novalidate), so errors can show
	// inline once a field has been left, and as a summary when submitting.
	type RequiredField = "first-name" | "email" | "message";
	const REQUIRED: RequiredField[] = ["first-name", "email", "message"];
	const FIELD_LABELS: Record<RequiredField, string> = { "first-name": "First Name", email: "Email", message: "Message" };
	const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	const emptyValues = () => ({ "first-name": "", email: "", message: "" });
	const untouched = () => ({ "first-name": false, email: false, message: false });
	let values = $state<Record<RequiredField, string>>(emptyValues());
	// A field shows its error only once it has been focused and left, or after a submit attempt
	let touched = $state<Record<RequiredField, boolean>>(untouched());
	let attempted = $state(false);

	function validate(field: RequiredField, value: string) {
		const trimmed = value.trim();
		if (field === "first-name") return trimmed ? "" : "Please enter your first name.";
		if (field === "email") {
			if (!trimmed) return "Please enter your email address.";
			return EMAIL_PATTERN.test(trimmed) ? "" : "Please enter a valid email address.";
		}
		return trimmed ? "" : "Please enter a message.";
	}

	const errors = $derived(Object.fromEntries(REQUIRED.map((field) => [field, validate(field, values[field])])) as Record<RequiredField, string>);
	const shownError = (field: RequiredField) => (touched[field] ? errors[field] : "");
	const invalidFields = $derived(REQUIRED.filter((field) => errors[field]));
	const summary = $derived(
		attempted && invalidFields.length
			? `Please complete the highlighted fields: ${invalidFields.map((field) => FIELD_LABELS[field]).join(", ")}.`
			: ""
	);
	const describedBy = (field: RequiredField, ...extra: string[]) =>
		[shownError(field) ? `contact-${field}-error` : "", ...extra].filter(Boolean).join(" ") || undefined;

	const remaining = $derived(MESSAGE_LIMIT - values.message.length);
	const remainingText = $derived(`${remaining} ${remaining === 1 ? "character" : "characters"} left`);
	// Announced only at thresholds rather than on every keystroke, so screen readers know before maxlength drops input
	const limitNotice = $derived(remaining === 0 ? "Character limit reached" : remaining <= 10 || remaining === 50 ? remainingText : "");

	const duration = () => (window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 500);
	// The sheet slides in from the right beside the backdrop on wider screens; on phones it fills the screen, so it drops in from the top
	const flyParams = () => ({
		...(window.matchMedia("(min-width: 768px)").matches ? { x: "100%" } : { y: "-100%" }),
		duration: duration(),
		easing: cubicOut
	});

	// Top layer and inert page behind it come from the native modal dialog.
	// Grab the opener first, as showModal() moves focus into the dialog.
	//
	// It also locks page scroll. Hiding the scrollbar would widen the page and shift it sideways, so the body is
	// padded by the scrollbar's width to hold it still; the full-screen dialog covers the space the scrollbar leaves.
	// The lock is released in destroy, which runs once the exit transition has finished, so the scrollbar can't
	// reappear beside the panel while it's still sliding out.
	function modal(node: HTMLDialogElement) {
		opener = document.activeElement as HTMLElement | null;

		const html = document.documentElement;
		const scrollbarWidth = window.innerWidth - html.clientWidth;
		const previous = { overflow: html.style.overflow, paddingRight: document.body.style.paddingRight };
		html.style.overflow = "hidden";
		document.body.style.paddingRight = `${scrollbarWidth}px`;

		node.showModal();

		return {
			destroy() {
				html.style.overflow = previous.overflow;
				document.body.style.paddingRight = previous.paddingRight;
			}
		};
	}

	// Following a link out of the panel shouldn't leave it open over the new page
	afterNavigate(closeContact);

	function onCancel(event: Event) {
		// Escape: close through state so the outro still plays
		event.preventDefault();
		closeContact();
	}

	function onClosed() {
		status = "idle";
		values = emptyValues();
		touched = untouched();
		attempted = false;
		// The dialog is still modal until it's removed, which keeps the page inert; close it so focus can move back out
		dialog?.close();
		// The mobile menu's Contact button unmounts as the menu closes, so fall back to whichever nav control is visible
		const fallback = [...document.querySelectorAll<HTMLElement>("button.nav-hamburger, button.nav-contact")].find((el) => el.offsetParent);
		(opener?.isConnected && opener.offsetParent ? opener : fallback)?.focus();
		opener = null;
	}

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		if (status === "sending") return;
		const form = event.currentTarget as HTMLFormElement;

		// Show every required field's error and move focus to the first one; the summary is announced by the status region
		attempted = true;
		touched = { "first-name": true, email: true, message: true };
		if (invalidFields.length) {
			status = "idle";
			await tick();
			form.querySelector<HTMLElement>(`[name="${invalidFields[0]}"]`)?.focus();
			return;
		}

		const data = new FormData(form);

		// Honeypot: bots fill every field, so pretend it worked and send nothing
		if (data.get("bot-field")) {
			status = "success";
		} else {
			status = "sending";
			data.set("form-name", "contact");
			try {
				const response = await fetch("/__forms.html", {
					method: "POST",
					headers: { "Content-Type": "application/x-www-form-urlencoded" },
					body: new URLSearchParams(data as unknown as Record<string, string>).toString()
				});
				status = response.ok ? "success" : "error";
			} catch {
				status = "error";
			}
		}

		// The form unmounts on success, so move focus to the message. Errors are announced by the status region
		// and focus stays on the submit button for a retry.
		if (status === "success") {
			await tick();
			statusEl?.focus();
		}
	}
</script>

{#if uiStore.contactOpen}
	<dialog class="contact" bind:this={dialog} use:modal aria-labelledby="contact-heading" oncancel={onCancel}>
		<div class="contact-backdrop modal-backdrop" aria-hidden="true" onclick={closeContact} transition:fade={{ duration: duration() }}></div>

		<!-- The sheet flies as one piece; the close button sits outside the scrolling panel so it stays in reach -->
		<div class="contact-sheet" transition:fly={flyParams()} onoutroend={onClosed}>
			<button class="contact-close" aria-label="Close contact form" onclick={closeContact}>
				<span class="contact-close-blur" aria-hidden="true"></span>
				<XIcon aria-hidden="true" />
			</button>

			<div class="contact-panel">
				<div class="contact-main">
					<div class="contact-heading">
						<p class="eyebrow" aria-hidden="true">Contact</p>
						<h2 id="contact-heading">Get in touch.</h2>
					</div>

					<p class="contact-status" role="status" tabindex="-1" bind:this={statusEl}>
						{#if status === "success"}
							Thanks for reaching out. We'll be in touch soon.
						{:else if status === "error"}
							Sorry, your message didn't send. Please try again, or email us at
							<a href="mailto:hello@madhucollective.ca">hello@madhucollective.ca</a>.
						{:else if summary}
							<span class="contact-summary">{summary}</span>
						{/if}
					</p>

					{#if status !== "success"}
						<!-- Posted to Netlify Forms by submit(). Netlify reads the form's settings (and honeypot) from the
					     matching stub in static/__forms.html, as it can't see server-rendered forms at build time -->
						<form
							class="contact-form group-stagger-fade"
							name="contact"
							novalidate
							aria-busy={status === "sending"}
							onsubmit={submit}
							use:isIntersecting
						>
							<div class="contact-field">
								<label for="contact-first-name">First Name <span class="contact-required" aria-hidden="true">*</span></label>
								<input
									id="contact-first-name"
									name="first-name"
									autocomplete="given-name"
									required
									aria-invalid={!!shownError("first-name")}
									aria-describedby={describedBy("first-name")}
									bind:value={values["first-name"]}
									onblur={() => (touched["first-name"] = true)}
								/>
								{#if shownError("first-name")}
									<p class="contact-error" id="contact-first-name-error">{shownError("first-name")}</p>
								{/if}
							</div>
							<div class="contact-field">
								<label for="contact-last-name">Last Name</label>
								<input id="contact-last-name" name="last-name" autocomplete="family-name" />
							</div>
							<div class="contact-field">
								<label for="contact-email">Email <span class="contact-required" aria-hidden="true">*</span></label>
								<input
									id="contact-email"
									name="email"
									type="email"
									autocomplete="email"
									required
									aria-invalid={!!shownError("email")}
									aria-describedby={describedBy("email")}
									bind:value={values.email}
									onblur={() => (touched.email = true)}
								/>
								{#if shownError("email")}
									<p class="contact-error" id="contact-email-error">{shownError("email")}</p>
								{/if}
							</div>
							<div class="contact-field">
								<label for="contact-phone">Phone Number</label>
								<input id="contact-phone" name="phone" type="tel" autocomplete="tel" />
							</div>
							<div class="contact-field contact-message">
								<label for="contact-message">Message <span class="contact-required" aria-hidden="true">*</span></label>
								<textarea
									id="contact-message"
									name="message"
									rows="3"
									maxlength={MESSAGE_LIMIT}
									required
									aria-invalid={!!shownError("message")}
									aria-describedby={describedBy("message", "contact-message-count")}
									bind:value={values.message}
									onblur={() => (touched.message = true)}></textarea>
								<!-- Error and counter share one line that's always there, so neither moves the layout -->
								<div class="contact-message-meta">
									{#if shownError("message")}
										<p class="contact-error" id="contact-message-error">{shownError("message")}</p>
									{/if}
									<p class="contact-count" id="contact-message-count">{remainingText}</p>
								</div>
								<p class="visually-hidden" role="status">{limitNotice}</p>
							</div>
							<div class="contact-actions">
								<PrimaryButton type="submit" text={status === "sending" ? "Sending…" : "Submit"} />
								<!-- New tab, so reading the policy doesn't throw away a half-written message -->
								<p class="contact-fine-print">
									By submitting you agree to our
									<a href="/privacy" target="_blank" rel="noopener noreferrer"
										>privacy policy<span class="visually-hidden"> (opens in a new tab)</span></a
									>
								</p>
							</div>
							<!-- Honeypot: inert, so people can't reach it, but bots filling every input will. Kept last so it doesn't shift the stagger delays -->
							<div class="contact-honeypot" inert>
								<label>Don't fill this out <input name="bot-field" tabindex="-1" autocomplete="off" /></label>
							</div>
						</form>
					{/if}
				</div>

				<div class="contact-info">
					<div class="contact-info-row">
						<h3 id="contact-location">Location</h3>
						<h3 id="contact-socials">Socials</h3>
					</div>
					<hr />
					<div class="contact-info-row">
						<ul aria-labelledby="contact-location">
							<!-- TODO: add the studio phone number, then restore: <li><a href="tel:+1...">Phone</a></li> -->
							<li><a href="mailto:hello@madhucollective.ca">Email</a></li>
							<li>
								<a href="https://maps.google.com/?q=Rossland,+BC" target="_blank" rel="noopener noreferrer"
									>Directions<span class="visually-hidden"> (opens in a new tab)</span></a
								>
							</li>
						</ul>
						<ul aria-labelledby="contact-socials">
							<li>
								<a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer"
									>Instagram<span class="visually-hidden"> (opens in a new tab)</span></a
								>
							</li>
							<li>
								<a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer"
									>Facebook<span class="visually-hidden"> (opens in a new tab)</span></a
								>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	</dialog>
{/if}

<style>
	/* Transparent full-screen shell; the backdrop and panel inside it carry the visuals so they can transition */
	dialog.contact {
		position: fixed;
		inset: 0;
		/* inset: 0 tracks the live viewport (unlike --vh, which is measured once); auto overrides the UA's fit-content */
		width: auto;
		max-width: none;
		height: auto;
		max-height: none;
		margin: 0;
		padding: 0;
		border: 0;
		background: none;
		overflow: hidden;
	}

	dialog.contact::backdrop {
		background: none;
	}

	div.contact-backdrop {
		position: absolute;
		inset: 0;
	}

	div.contact-sheet {
		position: absolute;
		top: 0;
		right: 0;
		width: 100%;
		height: 100%;
	}

	div.contact-panel {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		gap: var(--spacing-xl);
		width: 100%;
		height: 100%;
		overflow-y: auto;
		padding: var(--spacing-xl) var(--padding-inline);
		color: var(--color-text);
		/* Texture at 50% over peach, done as a half-peach wash so it scrolls with the panel */
		background-color: var(--color-background-peach);
		background-image: linear-gradient(color-mix(in srgb, var(--color-background-peach) 50%, transparent)), url(/assets/images/texture-offerings.webp);
		background-size: cover;
		background-attachment: local;
	}

	/* Over the panel's top-right corner, outside its scroll so it never scrolls away */
	button.contact-close {
		position: absolute;
		z-index: 1;
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

	/* Radial blur behind the icon, so content scrolling underneath softens instead of clashing with it.
	   backdrop-filter has one strength per element, so three stacked layers fake a gradient: each blurs harder
	   and is masked to a smaller radius, and they compound from barely-there at the rim to strongest at the centre. */
	button.contact-close::before,
	button.contact-close::after,
	span.contact-close-blur {
		content: "";
		position: absolute;
		inset: 0;
		z-index: -1;
		border-radius: 50%;
		pointer-events: none;
	}

	button.contact-close::before {
		backdrop-filter: blur(1px);
		mask-image: radial-gradient(closest-side, #000 50%, transparent);
	}

	span.contact-close-blur {
		backdrop-filter: blur(3px);
		mask-image: radial-gradient(closest-side, #000 25%, transparent 80%);
	}

	button.contact-close::after {
		backdrop-filter: blur(6px);
		mask-image: radial-gradient(closest-side, #000, transparent 55%);
	}

	/* High-contrast mode drops the blur, so give the control a visible edge */
	@media (forced-colors: active) {
		button.contact-close {
			border: 1px solid ButtonText;
		}
	}

	div.contact-main {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-l);
	}

	div.contact-heading {
		position: relative;
	}

	div.contact-heading h2 {
		position: relative;
		font-family: var(--font-body);
		font-size: var(--font-heading-m);
		font-weight: 600;
		line-height: 1.05;
	}

	p.contact-status:empty {
		display: none;
	}

	p.contact-status a {
		text-decoration: underline;
	}

	/* Rows sit a little further apart than the design's 16px, to leave room for a field's error under its line */
	form.contact-form {
		position: relative;
		display: grid;
		gap: calc(var(--spacing-m) + var(--spacing-s)) var(--spacing-m);
	}

	div.contact-field {
		display: flex;
		flex-direction: column;
	}

	div.contact-field label {
		font-size: 16px;
		font-weight: 500;
		letter-spacing: 0.8px;
	}

	div.contact-field input,
	div.contact-field textarea {
		height: var(--spacing-l);
		padding: 0;
		border: 0;
		border-bottom: var(--border-width) solid var(--color-text);
		border-radius: 0;
		background: none;
		color: inherit;
		font-size: 16px;
	}

	/* Fixed size so the form layout never moves. --message-lines is what MESSAGE_LIMIT of ordinary text needs at the
	   narrowest width of each breakpoint range (measured: 11 at 320px, 5 at 768, 4 at 1280, 3 at the 1440 design);
	   height counts the lines plus the bottom border. Unusual input (all caps, blank lines) scrolls inside the field. */
	div.contact-field textarea {
		--message-lines: 11;
		height: calc(var(--message-lines) * 1.2em + var(--border-width));
		line-height: 1.2;
		resize: none;
	}

	span.contact-required {
		color: var(--color-primary);
	}

	/* Field errors sit in the gap below the field's line, so showing one doesn't move anything */
	div.contact-field {
		position: relative;
	}

	/* Medium weight so the small text holds up against the 16px labels */
	p.contact-error {
		max-width: 100%;
		overflow-wrap: anywhere;
		font-size: 12px;
		font-weight: 500;
		line-height: 1.2;
		letter-spacing: 0.05em;
		color: var(--color-error);
	}

	div.contact-field > p.contact-error {
		position: absolute;
		top: calc(100% + 1px);
		left: 0;
	}

	div.contact-field input[aria-invalid="true"],
	div.contact-field textarea[aria-invalid="true"] {
		border-bottom-color: var(--color-error);
	}

	span.contact-summary {
		color: var(--color-error);
	}

	/* Message error and counter share this line, which is always there */
	div.contact-message-meta {
		display: flex;
		justify-content: space-between;
		gap: var(--spacing-m);
		margin-top: var(--spacing-xs);
	}

	p.contact-count {
		margin-left: auto;
		font-size: var(--font-body-s);
		letter-spacing: 0.05em;
		text-align: right;
	}

	div.contact-actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--spacing-m);
		margin-top: var(--spacing-m);
	}

	p.contact-fine-print {
		font-size: 10px;
		letter-spacing: 0.05em;
	}

	p.contact-fine-print a {
		text-decoration: underline;
	}

	div.contact-honeypot {
		position: absolute;
		left: -9999px;
		width: 1px;
		height: 1px;
		overflow: hidden;
	}

	div.contact-info {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-s);
	}

	div.contact-info-row {
		display: grid;
		grid-template-columns: repeat(2, 130px);
		column-gap: calc(var(--spacing-l) + var(--spacing-m));
	}

	div.contact-info h3,
	div.contact-info ul {
		font-size: 16px;
		font-weight: 500;
		letter-spacing: 0.8px;
	}

	div.contact-info hr {
		border: 0;
		border-top: var(--border-width) solid var(--color-text);
	}

	div.contact-info ul {
		padding: 0;
		list-style: none;
	}

	/* 24px minimum target (WCAG 2.5.8) */
	div.contact-info li a {
		display: inline-flex;
		align-items: center;
		min-height: 24px;
	}

	@media (hover: hover) {
		div.contact-info a:hover {
			text-decoration: underline;
		}
	}

	@media screen and (min-width: 768px) {
		div.contact-field textarea {
			--message-lines: 5;
		}

		div.contact-sheet {
			width: 85%;
		}

		form.contact-form {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		div.contact-message,
		div.contact-actions {
			grid-column: 1 / -1;
		}
	}

	@media screen and (min-width: 1024px) {
		button.contact-close {
			font-size: 32px;
		}
	}

	@media screen and (min-width: 1280px) {
		div.contact-field textarea {
			--message-lines: 4;
		}

		div.contact-sheet {
			/* 1041px of the 1440px design frame */
			width: 72%;
		}

		div.contact-panel {
			padding: 96px var(--spacing-xl);
		}

		/* Script sits up and to the left of the heading, as in the design */
		div.contact-heading .eyebrow {
			left: -56px;
			top: -86px;
		}
	}

	@media screen and (min-width: 1440px) {
		div.contact-field textarea {
			--message-lines: 3;
		}
	}
</style>
