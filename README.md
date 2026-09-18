# InDesign Academy

**Learn InDesign. Build Real Things. Master Layout.**

A self-paced, interactive learning system for Adobe InDesign — lessons, quizzes,
practice exercises, real client-style projects, a skill tree, a searchable
glossary/cheat-sheet/troubleshooting center, and local progress tracking.
Pure HTML/CSS/JavaScript, no backend, no build step, no accounts. Works as a
static site on GitHub Pages.

## Quick start (view it locally)

Because the app loads its content from JSON files via `fetch()`, most browsers
will block it if you just double-click `index.html` (the `file://` protocol
blocks fetch requests). Run a tiny local server instead:

```bash
cd indesign-academy
python3 -m http.server 8000
# then open http://localhost:8000 in your browser
```

Any static server works (`npx serve`, VS Code's "Live Server" extension, etc).

## Deploying to GitHub Pages

1. Create a new GitHub repository and push this folder's contents to it.
2. In the repo, go to **Settings → Pages**.
3. Under "Build and deployment", set **Source** to `Deploy from a branch`.
4. Choose the `main` branch and the `/ (root)` folder, then save.
5. GitHub gives you a URL like `https://yourusername.github.io/your-repo/`
   within a minute or two.

From then on: edit → commit → push, and the live site updates automatically.

## File structure

```text
indesign-academy/
├── index.html            # single shell page; everything else renders into #content
├── css/
│   ├── themes.css        # color tokens, light/dark mode
│   ├── style.css         # layout + components
│   └── responsive.css    # breakpoints
├── js/
│   ├── storage.js        # localStorage read/write (progress, checklists, quiz answers…)
│   ├── progress.js       # progress %, skill tree state, achievements, "what's next"
│   ├── lessons.js        # lesson list + lesson detail (the 11-part lesson template)
│   ├── projects.js       # Project Studio + Capstone
│   ├── exercises.js      # Practice Hub, Daily Practice, Fix This Design, Recreate Mode
│   ├── glossary.js       # Terminology dictionary
│   ├── shortcuts.js      # Cheat sheet + Troubleshooting Center
│   ├── search.js         # client-side search index
│   └── app.js            # router, data loading, homepage, sidebar/topbar chrome
├── data/
│   ├── courses.json      # the 16 levels (Orientation → Capstone) and which lessons/projects belong to each
│   ├── lessons.json      # all lesson content
│   ├── projects.json     # all Project Studio briefs
│   ├── exercises.json    # practice exercises, diagnostics, recreate-mode, daily-practice pool
│   ├── glossary.json     # terminology dictionary entries
│   ├── shortcuts.json    # keyboard shortcuts (Win + Mac)
│   └── troubleshooting.json
├── assets/                # images/icons/screenshots you add later
└── README.md
```

The app is **data-driven**: none of the educational content is hard-coded into
HTML. Everything in `data/*.json` is loaded at runtime, so you can add new
material just by editing JSON and pushing to GitHub.

## Adding a new lesson

Open `data/lessons.json` and add a new object to the array, following the
existing shape:

```json
{
  "id": "typography-03",
  "level": "L2",
  "title": "Optical Margin Alignment",
  "duration": "12 min",
  "skills": ["Typography"],
  "whatYoullLearn": "...",
  "whyItMatters": "...",
  "concept": "...",
  "interface": "...",
  "steps": ["...", "..."],
  "tryItYourself": "...",
  "challenge": "...",
  "commonMistakes": ["...", "..."],
  "proTip": "...",
  "knowledgeCheck": [
    { "q": "...", "options": ["...", "...", "...", "..."], "answerIndex": 0, "explanation": "..." }
  ],
  "checklist": ["...", "..."]
}
```

- `id` must be unique and URL-safe (used in `#/lesson/<id>`).
- `level` must match an existing `id` in `data/courses.json` (e.g. `"L2"`).
- To make it show up in that level's page, add its `id` to that level's
  `lessonIds` array in `data/courses.json`.

## Adding a new project

Add an object to `data/projects.json` (see existing entries for the shape:
`brief`, `dimensions`, `requirements`, `skills`, `steps`, `checklist`,
`commonMistakes`, `finalChallenge`, `deliverables`), then optionally add its
`id` to a level's `projectIds` in `data/courses.json` so it's grouped there.

## Adding a new exercise / diagnostic / recreate challenge / daily prompt

All of these live in `data/exercises.json`, which has four top-level keys:

- `exercises` — full practice exercises (Task/Requirements/Hints/etc.)
- `diagnostics` — "Fix This Design" entries (`issue` + `reveal`)
- `recreate` — "Recreate This Design" entries (`reference`, `hints`, `evaluationChecklist`)
- `daily` — an object with `"5min"`, `"15min"`, `"30min"` arrays of one-line prompt strings

Add new entries to the relevant array/object. No other file needs to change.

## Adding glossary terms, shortcuts, or troubleshooting entries

Edit `data/glossary.json`, `data/shortcuts.json`, or `data/troubleshooting.json`
directly — each is a flat array and the app re-renders automatically.

## Resetting your progress

Click the ↺ icon in the top bar (it asks for confirmation first). This clears
everything stored in `localStorage` under the key `indesignAcademy.v1` — no
server involved, so it only affects the browser/device you're using.

You can also reset manually from the browser console:

```js
localStorage.removeItem("indesignAcademy.v1");
location.reload();
```

## Notes

- No user accounts, no backend, no analytics. All progress lives in
  `localStorage` on the device you're using — it will **not** sync between
  devices or browsers.
- Content minimums shipped in this starter: 18 lessons, 5 projects,
  11 practice exercises, 6 design diagnostics, 4 recreate-mode challenges,
  35 glossary terms, 54 keyboard shortcuts, 12 troubleshooting entries —
  all easy to expand using the instructions above.
