# ASCEND — Training &amp; Fuel

Offline training log + meal plan. One page, no backend, everything in
`localStorage`.

**Run it:** open `index.html` in a browser. For home-screen install and offline
caching, serve the folder — `python3 -m http.server 8000` — or push to `main`,
which auto-deploys to Netlify.

## Training

- Tap **exercises only**. Days and weeks complete themselves.
  - All exercises in a day → **STAGE CLEARED**.
  - All 4 days → **LIMIT BROKEN** → *Begin Next Week* archives the week and
    starts a fresh one.
- Un-ticking ripples straight back up — day and week un-clear.
- **Streak** = consecutive weeks cleared; a gap over 14 days restarts it at 1.
- **LOG** on each exercise opens an optional weight × reps field, archived with
  the week so you can compare against last time.
- Reset controls sit at the bottom behind a confirm. *Reset Current Week* keeps
  history and streak; *Erase All Data* does not.

### Rest timer

Sticky bar at the bottom of the Training tab: presets (1:00 / 1:30 / 2:00 /
3:00), ±15s, start/pause/reset, buzz + tone on zero.

Remaining time is derived from an absolute end timestamp, never counted down in
a variable — phones throttle or freeze timers on a backgrounded tab, so locking
the screen mid-rest must still show the true time left. Closing the app
mid-rest and reopening resumes correctly; a rest that expired while the app was
shut shows `0:00` rather than firing late.

## Nutrition

Reference plan plus four **protein anchor** checkboxes (one per meal) that feed
a daily streak. Anchors and the selected lunch reset at midnight; the streak
walks back through a set of completed dates, so un-ticking is fully reversible.

## Theme

Light coffee base — creams, tans, warm browns — with crimson for power and
completion, and espresso for text. Sharp angular geometry, no rounded corners.
Progress bars are **POWER LEVEL** meters. All visuals are original CSS geometry
and all copy is original to this app; no third-party art, marks, or quotations.

Display face: [Anton](https://fonts.google.com/specimen/Anton) by Vernon Adams /
Cyreal, under the [SIL Open Font License 1.1](https://scripts.sil.org/OFL),
embedded as base64. Body text uses the system UI stack.

## Offline

The app makes **zero network requests** — the font is inlined, so there is no
CDN to fail. The service worker is network-first for the page (2.5s timeout,
then cache) so deploys land on their own, and cache-first for icons.

## Where your data lives

One `localStorage` key, `gains-quest-v1` — kept from the previous version on
purpose so existing history survived the redesign. It holds settings, streaks,
the week in progress, every cleared week, nutrition state and the rest timer.

Only `done` and `note` ever change on an exercise: day and week completion are
recomputed from the ticks rather than stored, so the two can't disagree. Writes
happen the instant you tap; note typing is debounced and flushed on background.
On boot the app calls `navigator.storage.persist()` to ask the browser not to
evict the data.

It never leaves the device. No sync between phone and desktop, and clearing site
data for the domain — or changing the site's URL — starts you fresh.

## Editing

- **Program:** the `PROGRAM` array at the top of the `<script>`,
  `[name, 'sets × reps', 'optional hint']`. Ticks and notes carry across an edit
  for any exercise whose name still matches.
- **Meals:** `MEALS` and `LUNCHES` arrays alongside it.
- **Hype copy:** the `HYPE` array.
- **Drop the notes feature:** delete the block marked `REMOVE-NOTES`.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | The entire app — markup, styles, logic, audio, font. |
| `manifest.json`, `sw.js` | PWA install + offline cache. |
| `netlify.toml` | Publish dir and cache headers for continuous deploy. |
| `icon-192.png`, `icon-512.png` | Home-screen icons. |
