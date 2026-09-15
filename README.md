# Night City Journal

Simple Cyberpunk 2077 completion tracker based on the supplied mission-tree image, including Phantom Liberty.

## Run

```sh
npm install
npm run dev
```

Open the URL printed by Vite. `npm run build` creates the frontend build in `dist`; run `npm run preview` to serve it with the local file API. Plain static hosting cannot save the progress file. `npm test` checks backup validation, filtering, and dataset integrity.

## Features

- 360 map entries, with legend colors and categories.
- Manual completion, search by quest/contact, completion filters, alphabetical sorting.
- Original high-resolution tree with clickable quest overlays, zoom, and locate-from-list.
- Plain text file persistence, text backup export/import, and support for older JSON backups.
- Responsive layout and keyboard-accessible controls.

## Data and progress

Mission flowchart image by **u/rolux**, shared in [Cyberpunk 2.0 + Phantom Liberty Mission Flowchart [UPDATED]](https://www.reddit.com/r/cyberpunkgame/comments/177pi79/cyberpunk_20_phantom_liberty_mission_flowchart/) on r/cyberpunkgame. The app uses the image supplied by the user.

`src/quests.json` was extracted from the supplied map with local macOS Vision OCR, with targeted corrections. Coordinates refer to the 9984 × 7936 source image in `public/quest-map.png`. The map credits itself as public domain. This dataset reflects that map, not a current exhaustive game database. Alternate branches, endings, tarot cards, and repeated interludes are separate entries; 100% can span multiple playthroughs. Dependencies remain visible in the original image, and are not enforced programmatically.

Progress is stored in `data/progress.txt`, automatically created on first app load. Each quest has a readable line:

```text
[x] q-289-3617 | The Nomad
[ ] q-801-3873 | The Rescue
```

Edit `[ ]` / `[x]` manually if desired; preserve all quest IDs and entries, then reload the app. Changes made in the app are written automatically by the local Vite server, using a temporary file and atomic replacement. The same file is shared across browsers. Returning focus to the app reloads the file. Keep the server running with `npm run dev` or `npm run preview`.

When the file does not yet exist, the app transfers any legacy localStorage progress from that browser once. It leaves the old browser copy untouched as a fallback; all ongoing reads and writes use the text file. If another browser has older progress to transfer, export and import its backup explicitly. The personal progress file is excluded from Git. There is no account or game-save integration.

Extraction utilities in `scripts` use Swift/AppKit/Vision on macOS and Python's standard library, with intermediate files in `/tmp`. They are not needed to run the app. Fonts use Google Fonts with local system fallbacks.

## Interactive flowchart

Open **Mission tree** to explore the original connected quest map. Drag to pan, use the zoom buttons or Ctrl/Command + scroll to zoom, and select a node to see its details. Completion changes from the detail panel update the journal immediately. Search, category, and status filters highlight matching nodes; the results panel jumps to a chosen quest. **Expand map** provides more room (Escape closes it), and **Fit map** returns to the overview.

## Iconic weapons

The **Iconic weapons** sidebar section contains 113 entries imported from the supplied [Google Sheet](https://docs.google.com/spreadsheets/d/1StSHyeT7RB-yUyAvr_4WDNGRElfhBro3A1JQNEJiu58/edit?gid=395592532). The source snapshot is in `sources/iconic-weapons.csv`; `scripts/build-weapons.py` produces `src/weapons.json`. Each weapon includes a link to its source row, acquisition source/location, and the sheet's notes. This is a snapshot of the supplied checklist, not a guarantee of current reward availability or an exhaustive current game database.

71 weapons have quest connections: acquisition missions, explicitly stated prerequisites, or a related mission. Mission names are matched to existing quest IDs, with aliases for the Arroyo fight, Sacrum Profanum, and War Pigs. World locations alone are not used to infer mission links. Source decision checkboxes and source collection checkboxes are not imported as your progress. Conditional cell formatting is not reproduced; acquisition notes are retained.

Quest rows show iconic weapon counts. Clicking a weapon's mission opens its flowchart node, whose details also show the associated weapons. Weapons are collected manually and independently of quest completion. Your existing quest progress is preserved.

Weapon progress saves automatically to `data/weapons.txt` using the same `[x]` / `[ ]` format, and can be exported from the armory. To restore a weapon backup, replace that file with the complete exported text and reload. Keep the local server running. The personal weapon progress file is excluded from Git.
# night-city-journal
