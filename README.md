# Sticky Notes App 🗒️

Quick notes that actually stick — colorful sticky notes saved in your browser.

## Features

- **Add notes** — type a note, pick one of six colors, hit Add (or press Ctrl+Enter).
- **Edit in place** — click any note's text to edit it; changes save automatically when you click away.
- **A color per note** — switch a note's color anytime from the dots on the note.
- **Search filter** — type in the search box to filter the board in real time.
- **Delete** — hit the ✕ on a note to remove it.
- **Saved in localStorage** — your notes survive a refresh. Nothing leaves your browser.

## Run locally

No build step, no dependencies — just open `index.html` in a browser, or serve it:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deploy

Deploy anywhere that serves static files (GitHub Pages, Netlify, Vercel…). Upload the whole folder as-is.

## Tech

Pure HTML, CSS, and vanilla JavaScript. Google Fonts only (Bricolage Grotesque, Inter, JetBrains Mono).
