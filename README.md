# Night City Journal

Simple Cyberpunk 2077 completion tracker based on the supplied mission-tree image, including Phantom Liberty.

## Run

```sh
npm install
npm run dev
```

Open the URL printed by Vite. `npm run build` creates a static website in `dist`; `npm run preview` serves that build locally. Deploy only `dist` to a static host. There is no progress API or server database. `npm test` checks storage, migration, backup validation, filtering, and dataset integrity.

Pushes to `main` deploy automatically to GitHub Pages through
`.github/workflows/deploy-pages.yml`.

## Features

- 360 map entries, with legend colors and categories.
- Manual completion, search by quest/contact, completion filters, alphabetical sorting.
- Original high-resolution tree with clickable quest overlays, zoom, and locate-from-list.
- Browser localStorage persistence, text backup import/export for quests and weapons, and support for older JSON backups.
- Responsive layout and keyboard-accessible controls.

## Data and progress

Mission flowchart image by **u/rolux**, shared in [Cyberpunk 2.0 + Phantom Liberty Mission Flowchart [UPDATED]](https://www.reddit.com/r/cyberpunkgame/comments/177pi79/cyberpunk_20_phantom_liberty_mission_flowchart/) on r/cyberpunkgame. The app uses the image supplied by the user.

`src/quests.json` was extracted from the supplied map with local macOS Vision OCR, with targeted corrections. Coordinates refer to the 9984 × 7936 source image in `public/quest-map.png`. The map credits itself as public domain. This dataset reflects that map, not a current exhaustive game database. Alternate branches, endings, tarot cards, and repeated interludes are separate entries; 100% can span multiple playthroughs. Dependencies remain visible in the original image, and are not enforced programmatically.

Progress saves automatically in the current browser's localStorage: `night-city-journal-v1` for quests and `night-city-weapons-v1` for weapons. A new browser starts with both checklists empty. Existing saved progress is preserved, and same-origin tabs synchronize through storage events. No personal progress is included in the site build.

Text backups have one readable line per entry:

```text
[x] q-289-3617 | The Nomad
[ ] q-801-3873 | The Rescue
```

Edit `[ ]` / `[x]` in a backup if desired; preserve all IDs and entries, then import it. Use **Import quest backup** for quests or **Import weapon backup** in the armory for weapons. Each import previews the checked-entry count and asks you to confirm replacement of that checklist only. Invalid or wrong-checklist files are rejected. Each checklist also has a text export button.

To migrate from the previous file-backed version, import `data/progress.txt` and `data/weapons.txt` through their matching controls. The original files remain backups and are no longer read or modified by the app. They are ignored by Git, excluded from `dist`, and blocked from being served by the development server. Legacy server utilities are retained for their file-format tests but are not enabled in Vite.

Browser progress is specific to the site address, including its port, and to the browser/profile. On a newly deployed domain, import both backups again. Export backups before clearing browser data or changing devices. Private browsing may discard data when the session ends. There is no account, cloud synchronization, or game-save integration.

Extraction utilities in `scripts` use Swift/AppKit/Vision on macOS and Python's standard library, with intermediate files in `/tmp`. They are not needed to run the app. Fonts use Google Fonts with local system fallbacks.

## Interactive flowchart

Open **Mission tree** to explore the original connected quest map. Drag to pan, use the zoom buttons or Ctrl/Command + scroll to zoom, and select a node to see its details. Completion changes from the detail panel update the journal immediately. Search, category, and status filters highlight matching nodes; the results panel jumps to a chosen quest. **Expand map** provides more room (Escape closes it), and **Fit map** returns to the overview.

## Iconic weapons

The **Iconic weapons** sidebar section contains 113 entries imported from the supplied [Google Sheet](https://docs.google.com/spreadsheets/d/1StSHyeT7RB-yUyAvr_4WDNGRElfhBro3A1JQNEJiu58/edit?gid=395592532). The source snapshot is in `sources/iconic-weapons.csv`; `scripts/build-weapons.py` produces `src/weapons.json`. Each weapon includes a link to its source row, acquisition source/location, and the sheet's notes. This is a snapshot of the supplied checklist, not a guarantee of current reward availability or an exhaustive current game database.

71 weapons have quest connections: acquisition missions, explicitly stated prerequisites, or a related mission. Mission names are matched to existing quest IDs, with aliases for the Arroyo fight, Sacrum Profanum, and War Pigs. World locations alone are not used to infer mission links. Source decision checkboxes and source collection checkboxes are not imported as your progress. Conditional cell formatting is not reproduced; acquisition notes are retained.

Quest rows show iconic weapon counts. Clicking a weapon's mission opens its flowchart node, whose details also show the associated weapons. Weapons are collected manually and independently of quest completion. Your existing quest progress is preserved.

Weapon progress saves to browser localStorage independently of quest progress. Use the armory's **Export weapon progress** and **Import weapon backup** controls to move the collection between browsers, including importing the original `data/weapons.txt`.
