# To do

There are two parts:

- **Part 1** lists what we need from the client, in plain language, ready to turn into an email.
- **Part 2** is a brief for a coding agent that works through the build tasks and asks Jacob for missing details as it goes.

---

# Part 1: What we need from the client

## Photos and video

Almost every photo on the site is a stock image standing in until we have real photos of Madhu. We'd like real photos for:

- **Homepage main image.** You mentioned a group class in the main studio, or the front desk with the heart. Send through any ideas or favourites.
- **Homepage video.** This still needs to be filmed. The idea is a walk through the front door and the space into a treatment room.
- **Page banners** at the top of the About, Practitioners & Treatments and Classes & Events pages.
- **The four homepage cards**: Classes, Therapeutic Appointments, Practitioners and Upcoming Events.
- **The Space** (About page): four photos of the rooms and the work that happens in them. Ideally, one each for massage, counselling, osteopathy and private yoga too.
- **Space rental**: a photo of the main room set up for a gathering.
- **Classes & events**: one photo each for Yoga Teacher Training, Community Yoga, Dance Nights and Films.
- **Headshots** of all six practitioners: Nadine, Clare, Michelle, Danielle, Jineya and Keith.
- **Previous team members**: photos and names, if you'd like to honour past practitioners on the Practitioners page.
- **A sharing image**: one landscape photo that shows up when someone shares the site on social media or in a text.

## Words

- **Core values.** We have Community and Collaborative Care. We still need the Inclusivity description, and to know whether there's a fourth value.
- **Treatments list on the homepage.** You asked us to list Osteopathy, Registered Massage Therapy and Clinical Counselling "just above" the video. Could you tell us a bit more about how you picture it? For example, a simple line of text, or links through to each treatment?
- **Practitioner bios.** A short bio for each of the six practitioners: a few sentences about their background and approach.
- **Practitioner titles.** On the Practitioners page we currently also list Clare and Danielle as owners, Clare as a yoga instructor and Michelle as a lactation consultant. Should those stay, or should we use only the credentials you sent?
- **Events.** Short descriptions for Community Yoga, Dance Nights and Films, plus up-to-date details for Yoga Teacher Training. It currently says "starting in October".
- **Space rental.** A few sentences about renting the space: what it suits, its capacity and how to enquire.
- **Testimonial.** The homepage quote is from "Joe". Is it a real review you're happy to publish, or do you have one you'd prefer?

## Details

- **Your street address**, for the map links.
- **A phone number**, if you'd like one shown on the site.
- **Your Instagram and Facebook page links.**
- **Mailchimp**: access to your account, or someone to share the signup form link, so the newsletter signup works.
- **Bookings**: what you use, or plan to use, for booking appointments and classes. That way the "Book" buttons can go straight to it.
- **Calendar editors**: who on your team should be able to add and edit events on the site calendar?
- **Daniel**: you mentioned getting access again through Daniel. What is the access for? For example, the old website, the domain or photos.
- **Privacy policy**: the business's legal name, and whether you're happy for us to draft a plain-English privacy policy for you to review.

---

# Part 2: Build brief (for an agent)

## How to run this

1. **Read first.** Read `CLAUDE.md` and follow it throughout.
2. **Collect inputs in one rapid-fire round.**
   - Go through the **Inputs** table and ask Jacob for every value marked `?`. Use `AskUserQuestion`, up to four questions per call, back to back. For free-text values, give short example options; Jacob can answer through "Other".
   - Don't ask about inputs marked `client` unless Jacob says they've arrived.
   - Jacob can answer "skip". Skipped inputs stay `?`, and any task that needs them stays open.
   - Write each answer into the table as soon as you get it.
3. **Work the tasks in order.** Do every task whose inputs are all filled in, and skip the ones marked **Blocked**. After each task:
   - run `npm run check` (0 errors)
   - run `npx prettier --write` on the changed files only
   - run the `ui-ux-reviewer` subagent if any `.svelte`, `.css` or `.html` file changed, and fix what it finds
   - tick the task's box
4. **Commit only if Jacob asks**, with a gitmoji subject.
5. **Finish with a summary**: what was done, what's still blocked, and anything Jacob has to do by hand (the **Manual** list).

## Inputs

| Key                | What                                                                                     | Value  |
| ------------------ | ---------------------------------------------------------------------------------------- | ------ |
| `ADDRESS`          | Studio street address, for the map links                                                 | ?      |
| `PHONE`            | Studio phone number, or "none"                                                           | ?      |
| `INSTAGRAM_URL`    | Instagram profile URL                                                                    | ?      |
| `FACEBOOK_URL`     | Facebook page URL                                                                        | ?      |
| `MAILCHIMP_ACTION` | Mailchimp embedded-form action URL (`https://….list-manage.com/subscribe/post?u=…&id=…`) | ?      |
| `LEGAL_NAME`       | Business legal name, for the privacy policy                                              | ?      |
| `PRIVACY_EMAIL`    | Contact address for privacy requests (default `hello@madhucollective.ca`)                | ?      |
| `COOKIE_BANNER`    | Build a consent banner: `yes`, `no` (just a cookies section) or `later`                  | ?      |
| `FAQS`             | Build an FAQ section (`yes`, plus the questions) or delete the placeholder (`no`)        | ?      |
| `OG_IMAGE`         | Social share image: a file path, or `crop` to make an interim one from the home hero     | ?      |
| `BOOKING_URLS`     | Booking link for each treatment, the nav "Book Now" and each event card                  | client |
| `ADMIN_UIDS`       | Firebase UIDs of every calendar admin                                                    | client |

## Tasks

- [ ] **1. Contact and social links.** Needs `ADDRESS`, `PHONE`, `INSTAGRAM_URL` and `FACEBOOK_URL`.
  - **Where:** the footer and contact panel hard-code the Location, Instagram and Facebook links, and the Phone link is commented out (TODO in `ContactPanel.svelte`).
  - **Do:** move all four into one shared module (e.g. `src/lib/data/contact.ts`) and use it in both components.
  - **Address:** point the map links at a Google Maps search for the full address.
  - **Phone:** restore the Phone link as `tel:`. If `PHONE` is `none`, delete the TODO instead.
- [ ] **2. Newsletter → Mailchimp.** Needs `MAILCHIMP_ACTION`.
  - **Where:** `src/lib/components/Newsletter.svelte` currently calls `preventDefault()` and sends nothing.
  - **Submit:** to Mailchimp's `post-json` JSONP endpoint, the action URL with `/post?` changed to `/post-json?` and `&c=<callback>` added, so the visitor stays on the page.
  - **Honeypot:** include Mailchimp's `b_<u>_<id>` field.
  - **Feedback:** disable the button while sending. Show success and errors inline and announce them through a live region; there's no modal, so a toast is also fine. Map Mailchimp's "already subscribed" message to a friendly line.
- [ ] **3. Privacy policy.** Needs `LEGAL_NAME` and `PRIVACY_EMAIL`, and task 2 should be done first.
  - **Where:** `/privacy`, replacing the placeholder date and text.
  - **Sections:**
    - who we are
    - what we collect: the contact form via Netlify Forms, newsletter via Mailchimp, and Plausible analytics (cookieless)
    - why
    - who processes it, and that this may be outside Canada
    - retention
    - access and deletion requests
    - a `#cookies` section
    - contact
  - **Framing:** BC PIPA. Note that the site doesn't collect health information, and that clinical records are handled separately by each practitioner.
  - **Review:** mark it clearly for Jacob and the client to review; it's not legal advice.
- [ ] **4. Cookies.** Needs `COOKIE_BANNER`, and task 3 should be done first.
  - **Always:** make sure the footer's `/privacy#cookies` link lands on the cookies section. That section says ordinary visitors get no cookies: Plausible is cookieless, and Firebase only loads for admins.
  - **If `yes`:** add a small, non-modal consent bar to the root layout. It needs Accept and Decline buttons that can be reached by keyboard and form a labelled region. Store the choice in `localStorage`, wrapped in try/catch. Only load third-party scripts that set cookies after consent.
  - **If `later`:** do the section only, and leave this task open.
- [ ] **5. Sitemap.** Generate `sitemap.xml` for `/`, `/about`, `/treatments-practitioners`, `/classes-events` and `/privacy`, either as a prerendered `src/routes/sitemap.xml/+server.ts` or as a static file. Add `Sitemap: https://madhucollective.ca/sitemap.xml` to `static/robots.txt`.
- [ ] **6. Social share image.** Needs `OG_IMAGE`.
  - **Where:** `SeoHead.svelte` points at `/assets/images/og-image.jpg`, which doesn't exist.
  - **Do:** add a 1200×630 JPG under 300 KB. If `crop`, crop it from `hero-home.webp`.
  - **Also:** make the `og:image` URL absolute (`https://madhucollective.ca/...`), since some scrapers need that.
- [ ] **7. FAQs.** Needs `FAQS`. If `no`, delete `src/lib/data/faqs.ts`. If `yes`, build an accessible accordion section (reuse `slideOpen`, as the practitioner bios do) on the page Jacob picks.
- [ ] **8. Booking links.** **Blocked** on `BOOKING_URLS`. Replace `bookingHref` in `treatments-practitioners/+page.svelte`, the event card `href`s in `classes-events/+page.svelte`, and the nav's "Book Now" (`Nav.svelte`). Remove the related TODOs.
- [ ] **9. Admin allowlist.** **Blocked** on `ADMIN_UIDS`. Update `PUBLIC_ADMIN_UIDS` in `.env` and `isAdmin()` in `firestore.rules`, and delete the stale TODO comment there. Remind Jacob to set the Netlify env var and run `firebase deploy --only firestore:rules`.
- [ ] **10. Real photos.** **Blocked** on the client's photos.
  - **Do:** when files land, convert each to WebP at most 2048px wide and replace the stock image of the same role. Update the paths and write real `alt` text, or `alt=""` where the image is decorative.
  - **Practitioners:** add an `img` field to each practitioner on the About page (`person-photo`) and the Practitioners page (replacing the initials block).
  - **Previous team members:** replace the nine empty circles, each with a visually hidden name.
- [ ] **11. Home video.** **Blocked** on footage.
  - **Do:** replace `div.video-frame`'s "VIDEO" placeholder in `src/routes/+page.svelte` with a `<video>` that's muted, `playsinline`, looped and `preload="metadata"`, with a poster image.
  - **Formats:** WebM plus an MP4 fallback in `static/assets/video/`.
  - **Controls:** a visible pause/play button. Keep it paused under `prefers-reduced-motion`.
  - **Keep:** the existing `enterProgress` widening effect.

## Manual (Jacob, in dashboards)

- [ ] **Netlify Forms:** set up email notifications so contact form submissions reach `hello@madhucollective.ca`.
- [ ] **Plausible:** add the `madhucollective.ca` site so the proxied script records visits.
- [ ] **Launch:**
  - point the domain at Netlify
  - set the production env vars (Firebase and `PUBLIC_ADMIN_UIDS`)
  - run a final Lighthouse and accessibility pass
  - merge `client-feedback` into `master`
