# Calendar (SVAR)

- `@svar-ui/svelte-calendar` (MIT) shows a month view on `/classes-events`. Events live in the Firestore `events` collection (`src/lib/calendar/events.ts`). Anyone can read them; only admins can write, and the rules validate the event's shape.
- `EventCalendar.svelte` renders an SSR placeholder, then lazy-imports `CalendarView.svelte`, which holds all the SVAR wiring. Admins get an "Edit mode" switch above it, and the calendar is read-only until it's on.
- The SVAR MCP server (`svar-mcp` in `.mcp.json`) is the source of truth for `@svar-ui/svelte-calendar` APIs. Query it before writing or changing calendar code. Only its `Search` tool with `mode: "sparse"` works; Inference and dense search return a 429 on SVAR's side. The package source in `node_modules/@svar-ui/` is the fallback.
- SVAR quirks the code works around (don't undo these without checking):
  - **Snapshot resets.** A new `events` array re-inits the store and snaps back to the `date` prop. Set `date` from `api.getState().currentDate` before replacing events.
  - **Editor autosave.** `autoSave` writes on every keystroke, so the Editor runs with `autoSave={false}` and a custom bottom bar (Delete, Duplicate, Cancel, Save). Closing it mid-save throws, so the close is deferred.
  - **Month-view creation.** Month view has no click-to-create; `onGridClick` adds an all-day event. Clicking a day number tries to open Day view, so the `navigate-to` intercept blocks it.
  - **All-day end dates.** An all-day event's `end` is the exclusive next midnight. `EventDatesField` shows and edits the inclusive "Last day". Do date arithmetic in calendar days, not milliseconds, because of DST.
  - **Theme and icons.** Willow's `fonts={false}` also drops the `wxi` icon font, and the upstream prev/next buttons have no labels. The toolbar therefore uses custom `CalendarNavButtons` and `CalendarAddButton`.
  - **Category field.** It's a native `<select>` (`CategorySelect`), because SVAR's RichSelect is unlabelled.
  - **Payload typing.** Action payloads are typed as unions, so use the typed `intercept` / `on` helpers in CalendarView.
  - **Theme variables.** They go on `:global(:root .wx-willow-theme)`. Popup and modal z-index is 1050, above the nav's 1000.
- The studio is Canadian. Editor date pickers use day/month/year (`%d/%m/%Y`), and the display text in `format.ts` uses the `en-CA` locale. Weeks start on Sunday.
- The event popup isn't keyboard-reachable, so the accessible list of the month's events below the grid must stay.
