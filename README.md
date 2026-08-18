# GAINS QUEST

Retro 8-bit workout tracker. One page, no backend, all progress in `localStorage`.

**Run it:** open `index.html` in a browser — or, to enable "Add to Home Screen" +
offline caching, serve the folder: `python3 -m http.server 8000` then visit
`http://localhost:8000` (use your Mac's LAN IP from your phone).

## How it works

- Tap **exercises only**. Days and weeks tick themselves.
  - All exercises in a day done → **STAGE CLEAR**.
  - All 4 days done → **WORLD CLEAR!** → tap *Start Next World* to archive the
    week to history and roll a fresh, fully un-ticked week.
- Un-ticking anything ripples straight back up — the day and week un-clear.
- **Streak** = consecutive weeks cleared. A gap of more than 14 days between
  clears restarts it at 1.
- The pencil button on each exercise opens an optional **weight × reps** field.
  It's saved into history with the week, so you can compare week to week.
- **Sound** and **scanlines** toggle in the header; both persist.
- Reset controls sit at the bottom in magenta, behind a confirm step.
  *Reset Current World* keeps history + streak; *Erase All Data* does not.

## Editing the program

The whole routine is the `PROGRAM` array near the top of the `<script>` in
`index.html` — `[name, 'sets × reps']` pairs. Edit it and reload; ticks and
notes for exercises whose name still matches are carried over.

## Dropping the notes feature

Delete the block between the `---- REMOVE-NOTES` and `---- /REMOVE-NOTES`
comments in `index.html`, plus the `<button class="note-btn">` line in the same
row template.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | The entire app — HTML, CSS, JS, sound, all inline. |
| `manifest.json`, `sw.js` | PWA install + offline cache (only used over http). |
| `icon-192.png`, `icon-512.png` | Home-screen icons. |

## Offline

The app makes **zero network requests**. The pixel font is embedded in
`index.html` as a base64 woff2, so there is no CDN to fail and nothing to warm
up — it renders identically in airplane mode on a first load.

Font: [Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P) by
CodeMan38, used under the [SIL Open Font License 1.1](https://scripts.sil.org/OFL).

## Installing on a phone

1. Host the folder on any static HTTPS host (Netlify Drop, GitHub Pages, …).
2. Open the URL once on the phone.
3. Chrome (Android) offers **Install app**; iOS Safari uses
   Share → **Add to Home Screen**.

After that first load the service worker has cached everything, so it runs with
no signal.

## Where your data lives

One `localStorage` key, `gains-quest-v1`, holding the whole state as JSON:
settings, streak, the week in progress, and every cleared week. Only `done` and
`note` ever change — day and week completion are recomputed from the ticks
rather than stored, so the two can't disagree.

Writes happen the instant you tap an exercise; note typing is debounced and
flushed when the app is backgrounded. On boot the app calls
`navigator.storage.persist()` to ask the browser to exempt the data from
automatic eviction (usually granted once installed to the home screen).

It never leaves the device — the host only ever serves the empty app. So there
is no sync between phone and desktop, and clearing site data for the domain, or
changing the site's URL, starts you fresh.
