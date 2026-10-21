<!--
	DRAFT for Jacob and the client to review before launch. It's a plain-English starting point written against BC PIPA,
	not legal advice. Check especially the retention periods, which are commitments the studio has to keep.
-->
<script lang="ts">
	import SeoHead from "$lib/components/SeoHead.svelte";
	import { contact } from "$lib/data/contact";

	const LEGAL_NAME = "Madhu Wellness Collective";
</script>

<SeoHead
	title="Privacy Policy | Madhu Wellness Collective"
	description="How Madhu Wellness Collective collects, uses and protects your information."
/>

<main>
	<section class="privacy">
		<h1 class="section-heading">Privacy Policy</h1>
		<p class="text-light">Last updated: October 21, 2026</p>

		<h2 class="text-semi-bold">Who we are</h2>
		<p class="text-light">
			This website is run by {LEGAL_NAME}, a wellness studio in Rossland, British Columbia. This policy explains what personal information the website
			collects, why, and what you can ask us to do with it. We follow British Columbia's Personal Information Protection Act (PIPA).
		</p>

		<h2 class="text-semi-bold">What we collect</h2>
		<ul class="text-light">
			<li>
				<strong>Contact form.</strong> Your first name, and anything else you choose to give us: last name, email address, phone number and your message.
			</li>
			<li><strong>Newsletter.</strong> Your email address, if you sign up.</li>
			<li>
				<strong>Visit statistics.</strong> Anonymous counts such as which pages are viewed, the referring website, and your browser, device type and country.
				These can't be used to identify you.
			</li>
		</ul>
		<p class="text-light">
			This website does not collect health information. Please don't include health details in the contact form. Clinical records from your treatments
			are kept separately by each practitioner, under their own professional obligations, and aren't covered by this policy.
		</p>

		<h2 class="text-semi-bold">Why we collect it</h2>
		<ul class="text-light">
			<li>Contact form details are used only to reply to your message.</li>
			<li>Newsletter addresses are used only to send our newsletter. You can unsubscribe with the link in any email.</li>
			<li>Visit statistics help us understand which parts of the site are useful, so we can improve it.</li>
		</ul>
		<p class="text-light">We don't sell your information or share it with anyone for their own marketing.</p>

		<h2 class="text-semi-bold">Who processes it</h2>
		<p class="text-light">We use a few trusted services to run the site. They handle your information on our behalf:</p>
		<ul class="text-light">
			<li><strong>Netlify</strong> hosts the website and receives contact form messages.</li>
			<li><strong>Mailchimp</strong> stores newsletter subscriptions and sends the newsletter.</li>
			<li><strong>Plausible Analytics</strong> counts visits without cookies and without collecting personal information.</li>
			<li><strong>Google Firebase</strong> delivers the events calendar.</li>
		</ul>
		<p class="text-light">
			These services may store or process information outside Canada, including in the United States, where it may be accessible to authorities under
			local law.
		</p>

		<h2 class="text-semi-bold">How long we keep it</h2>
		<ul class="text-light">
			<li>Contact form messages are kept for up to 12 months after our last exchange with you, then deleted.</li>
			<li>Newsletter addresses are kept until you unsubscribe.</li>
			<li>Visit statistics are anonymous and kept in aggregate.</li>
		</ul>

		<h2 class="text-semi-bold">Your rights</h2>
		<p class="text-light">
			You can ask to see the personal information we hold about you, ask us to correct it, or ask us to delete it. Email us at the address below and
			we'll respond within 30 days. If you're not satisfied with our response, you can contact the Office of the Information and Privacy Commissioner
			for British Columbia.
		</p>

		<h2 class="text-semi-bold" id="cookies">Cookies</h2>
		<p class="text-light">
			This website doesn't set cookies for visitors. Our visit statistics come from Plausible Analytics, which works without cookies, and the site
			doesn't use advertising or tracking cookies. The only exception is our own staff: when a studio administrator signs in to edit the events
			calendar, the sign-in service stores what it needs to keep them signed in.
		</p>

		<h2 class="text-semi-bold">Contact</h2>
		<p class="text-light">
			Questions or requests about your privacy can be sent to <a href="mailto:{contact.email}">{contact.email}</a>.
		</p>
	</section>
</main>

<style>
	section.privacy {
		display: grid;
		gap: var(--spacing-m);
		margin-top: 4.5rem;
		font-size: var(--font-body-m);
	}

	section.privacy h1 {
		color: var(--color-primary);
	}

	section.privacy h2 {
		font-size: var(--font-heading-s);
		margin-top: var(--spacing-m);
	}

	section.privacy ul {
		display: grid;
		gap: var(--spacing-s);
		padding-left: 1.25em;
		list-style: disc;
	}

	section.privacy a {
		text-decoration: underline;
	}
</style>
